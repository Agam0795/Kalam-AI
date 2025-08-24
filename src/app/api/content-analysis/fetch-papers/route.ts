import { NextRequest, NextResponse } from 'next/server';

interface SemanticScholarAuthor {
  authorId: string;
  name: string;
  affiliations: string[];
  paperCount: number;
  citationCount: number;
  hIndex: number;
}

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string;
  venue: string;
  year: number;
  authors: Array<{
    name: string;
    authorId: string;
  }>;
  citationCount: number;
  url: string;
  isOpenAccess?: boolean;
  openAccessPdf?: {
    url: string;
    status: string;
  };
  externalIds: {
    DOI?: string;
    ArXiv?: string;
    PubMed?: string;
  };
}

interface FormattedPaper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  abstract: string;
  citationCount: number;
  isOpenAccess?: boolean;
  pdfUrl?: string;
  links: {
    semanticScholar: string;
    doi?: string;
    arxiv?: string;
    pubmed?: string;
  };
}

// Helper function to calculate name similarity
function calculateNameSimilarity(searchName: string, authorName: string): number {
  const search = searchName.toLowerCase().trim();
  const author = authorName.toLowerCase().trim();
  
  // Exact match
  if (search === author) return 1.0;
  
  // Check if search is contained in author name or vice versa
  if (author.includes(search) || search.includes(author)) return 0.9;
  
  // Check word overlap
  const searchWords = search.split(' ').filter((word: string) => word.length > 1);
  const authorWords = author.split(' ').filter((word: string) => word.length > 1);
  
  if (searchWords.length === 0 || authorWords.length === 0) return 0;
  
  const matchingWords = searchWords.filter((searchWord: string) => 
    authorWords.some((authorWord: string) => 
      authorWord.includes(searchWord) || searchWord.includes(authorWord)
    )
  ).length;
  
  return matchingWords / Math.max(searchWords.length, authorWords.length);
}

export async function POST(request: NextRequest) {
  try {
    const { authorName, affiliation } = await request.json();

    if (!authorName || authorName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      );
    }

    // Step 1: Search for the author with multiple strategies
    const cleanAuthorName = authorName.trim();
    console.log(`Original search query: "${cleanAuthorName}"`);

    // Try different search strategies
    const searchQueries = [
      // Strategy 1: Original query with affiliation
      affiliation ? `${cleanAuthorName} ${affiliation.trim()}` : cleanAuthorName,
      // Strategy 2: Just the author name (in case affiliation is causing issues)
      cleanAuthorName,
      // Strategy 3: Try with common academic titles removed
      cleanAuthorName.replace(/^(Dr\.?|Prof\.?|Professor)\s+/i, ''),
      // Strategy 4: Try last name first if it contains multiple words
      cleanAuthorName.includes(' ') ? cleanAuthorName.split(' ').reverse().join(' ') : null
    ].filter(Boolean);

    let authorSearchData = null;
    let successfulQuery = '';

    for (const query of searchQueries) {
      console.log(`Trying search query: "${query}"`);
      
      try {
        const authorSearchResponse = await fetch(
          `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(query)}&limit=20`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (authorSearchResponse.ok) {
          const data = await authorSearchResponse.json();
          console.log(`Query "${query}" returned ${data.data?.length || 0} results`);
          
          if (data.data && data.data.length > 0) {
            authorSearchData = data;
            successfulQuery = query;
            break;
          }
        } else {
          console.warn(`Query "${query}" failed with status: ${authorSearchResponse.status}`);
        }
      } catch (error) {
        console.warn(`Query "${query}" failed with error:`, error);
        continue;
      }
    }

    if (!authorSearchData || !authorSearchData.data || authorSearchData.data.length === 0) {
      return NextResponse.json({
        message: `No authors found for "${cleanAuthorName}". Try checking the spelling or use a more complete name.`,
        suggestions: [
          'Check the spelling of the author\'s name',
          'Try using the full name instead of initials',
          'Remove academic titles (Dr., Prof.) from the search',
          'Try searching without the affiliation',
          'Use the author\'s most commonly published name'
        ],
        searchedQueries: searchQueries,
        authors: [],
        papers: []
      });
    }

    const authors: SemanticScholarAuthor[] = authorSearchData.data;
    console.log(`Found ${authors.length} potential authors using query: "${successfulQuery}"`);

    // Step 2: Get the most relevant author with improved matching
    let selectedAuthor = authors[0];
    
    if (affiliation && affiliation.trim().length > 0) {
      const affiliationLower = affiliation.toLowerCase();
      console.log(`Looking for affiliation containing: "${affiliationLower}"`);
      
      // Try exact affiliation match first
      let authorWithMatchingAffiliation = authors.find(author => 
        author.affiliations?.some(aff => 
          aff.toLowerCase().includes(affiliationLower)
        )
      );
      
      // If no exact match, try partial matching
      if (!authorWithMatchingAffiliation) {
        const affiliationWords = affiliationLower.split(' ').filter((word: string) => word.length > 2);
        authorWithMatchingAffiliation = authors.find(author =>
          author.affiliations?.some(aff => 
            affiliationWords.some((word: string) => aff.toLowerCase().includes(word))
          )
        );
      }
      
      if (authorWithMatchingAffiliation) {
        selectedAuthor = authorWithMatchingAffiliation;
        console.log(`Selected author by affiliation match: ${selectedAuthor.name}`);
      } else {
        console.log(`No affiliation match found, using author with most papers`);
      }
    }
    
    // If no affiliation match or no affiliation provided, select by paper count and name similarity
    if (!affiliation || selectedAuthor === authors[0]) {
      // Calculate name similarity and combine with paper count
      const scoredAuthors = authors.map(author => {
        const nameSimilarity = calculateNameSimilarity(cleanAuthorName, author.name);
        const paperScore = Math.min(author.paperCount / 100, 1); // Normalize paper count
        const combinedScore = nameSimilarity * 0.7 + paperScore * 0.3;
        
        return { ...author, score: combinedScore };
      });
      
      scoredAuthors.sort((a, b) => b.score - a.score);
      selectedAuthor = scoredAuthors[0];
      console.log(`Selected author by combined score: ${selectedAuthor.name} (score: ${scoredAuthors[0].score.toFixed(2)})`);
    }

    console.log(`Selected author: ${selectedAuthor.name} (${selectedAuthor.authorId})`);

    // Step 3: Fetch papers for the selected author
    const papersResponse = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/${selectedAuthor.authorId}/papers?fields=paperId,title,abstract,venue,year,authors,citationCount,url,externalIds,isOpenAccess,openAccessPdf&limit=50`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!papersResponse.ok) {
      console.error(`Papers fetch failed: ${papersResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch papers for author' },
        { status: 500 }
      );
    }

    const papersData = await papersResponse.json();
    const papers: SemanticScholarPaper[] = papersData.data || [];

    if (papers.length === 0) {
      return NextResponse.json({
        message: `Found author "${selectedAuthor.name}" but no papers are available in Semantic Scholar database.`,
        selectedAuthor: {
          id: selectedAuthor.authorId,
          name: selectedAuthor.name,
          affiliations: selectedAuthor.affiliations || [],
          paperCount: selectedAuthor.paperCount || 0,
          citationCount: selectedAuthor.citationCount || 0,
          hIndex: selectedAuthor.hIndex || 0
        },
        alternativeAuthors: authors.slice(0, 5).map(author => ({
          id: author.authorId,
          name: author.name,
          affiliations: author.affiliations || [],
          paperCount: author.paperCount || 0
        })),
        papers: [],
        totalFound: 0
      });
    }

    // Step 4: Format the papers for frontend consumption
    const formattedPapers: FormattedPaper[] = papers.map(paper => ({
      id: paper.paperId,
      title: paper.title || 'Untitled',
      authors: paper.authors?.map(author => author.name) || [],
      venue: paper.venue || 'Unknown Venue',
      year: paper.year || 0,
      abstract: paper.abstract || 'No abstract available',
      citationCount: paper.citationCount || 0,
      isOpenAccess: paper.isOpenAccess || false,
      pdfUrl: paper.openAccessPdf?.url,
      links: {
        semanticScholar: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        doi: paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : undefined,
        arxiv: paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds.ArXiv}` : undefined,
        pubmed: paper.externalIds?.PubMed ? `https://pubmed.ncbi.nlm.nih.gov/${paper.externalIds.PubMed}/` : undefined,
      }
    }));

    // Sort papers by citation count (most cited first)
    formattedPapers.sort((a, b) => b.citationCount - a.citationCount);

    return NextResponse.json({
      message: 'Papers fetched successfully',
      selectedAuthor: {
        id: selectedAuthor.authorId,
        name: selectedAuthor.name,
        affiliations: selectedAuthor.affiliations || [],
        paperCount: selectedAuthor.paperCount || 0,
        citationCount: selectedAuthor.citationCount || 0,
        hIndex: selectedAuthor.hIndex || 0
      },
      alternativeAuthors: authors.slice(0, 5).map(author => ({
        id: author.authorId,
        name: author.name,
        affiliations: author.affiliations || [],
        paperCount: author.paperCount || 0
      })),
      papers: formattedPapers,
      totalFound: formattedPapers.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching papers' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Academic Papers Search API',
    usage: 'POST with { "authorName": "Professor Name", "affiliation": "University (optional)" }',
    dataSources: ['Semantic Scholar'],
    features: [
      'Author disambiguation by affiliation',
      'Paper metadata with abstracts',
      'Citation counts and rankings',
      'Multiple external links (DOI, arXiv, PubMed)',
      'Alternative author suggestions'
    ]
  });
}
