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
  links: {
    semanticScholar: string;
    doi?: string;
    arxiv?: string;
    pubmed?: string;
  };
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

    // Step 1: Search for the author
    const authorSearchQuery = affiliation 
      ? `${authorName.trim()} ${affiliation.trim()}`
      : authorName.trim();

    console.log(`Searching for author: ${authorSearchQuery}`);

    const authorSearchResponse = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorSearchQuery)}&limit=10`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!authorSearchResponse.ok) {
      console.error(`Author search failed: ${authorSearchResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to search for author' },
        { status: 500 }
      );
    }

    const authorSearchData = await authorSearchResponse.json();
    const authors: SemanticScholarAuthor[] = authorSearchData.data || [];

    if (authors.length === 0) {
      return NextResponse.json({
        message: 'No authors found with that name',
        authors: [],
        papers: []
      });
    }

    // Step 2: Get the most relevant author (highest paper count or best affiliation match)
    let selectedAuthor = authors[0];
    
    if (affiliation && affiliation.trim().length > 0) {
      const affiliationLower = affiliation.toLowerCase();
      const authorWithMatchingAffiliation = authors.find(author => 
        author.affiliations.some(aff => 
          aff.toLowerCase().includes(affiliationLower)
        )
      );
      if (authorWithMatchingAffiliation) {
        selectedAuthor = authorWithMatchingAffiliation;
      }
    } else {
      // Select author with highest paper count if no affiliation specified
      selectedAuthor = authors.reduce((prev, current) => 
        (current.paperCount > prev.paperCount) ? current : prev
      );
    }

    console.log(`Selected author: ${selectedAuthor.name} (${selectedAuthor.authorId})`);

    // Step 3: Fetch papers for the selected author
    const papersResponse = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/${selectedAuthor.authorId}/papers?fields=paperId,title,abstract,venue,year,authors,citationCount,url,externalIds&limit=50`,
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

    // Step 4: Format the papers for frontend consumption
    const formattedPapers: FormattedPaper[] = papers.map(paper => ({
      id: paper.paperId,
      title: paper.title || 'Untitled',
      authors: paper.authors?.map(author => author.name) || [],
      venue: paper.venue || 'Unknown Venue',
      year: paper.year || 0,
      abstract: paper.abstract || 'No abstract available',
      citationCount: paper.citationCount || 0,
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
        affiliations: selectedAuthor.affiliations,
        paperCount: selectedAuthor.paperCount,
        citationCount: selectedAuthor.citationCount,
        hIndex: selectedAuthor.hIndex
      },
      alternativeAuthors: authors.slice(0, 5).map(author => ({
        id: author.authorId,
        name: author.name,
        affiliations: author.affiliations,
        paperCount: author.paperCount
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
