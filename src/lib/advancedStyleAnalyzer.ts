// Backwards-compatible re-export shim ensuring both named and default exports propagate.
import LinguisticPersonaEmulator, { 
	linguisticPersonaEmulator,
	styleAnalyzer,
	type LinguisticFingerprint,
	type StyleAnalysis
} from './analyzers/advancedStyleAnalyzer';

export {
	LinguisticPersonaEmulator,
	linguisticPersonaEmulator,
	styleAnalyzer,
	type LinguisticFingerprint,
	type StyleAnalysis
};

export default LinguisticPersonaEmulator;
