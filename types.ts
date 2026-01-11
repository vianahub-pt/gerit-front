
export interface ChangeList {
  id: string;
  project: string;
  branch: string;
  subject: string;
  status: 'NEW' | 'MERGED' | 'ABANDONED';
  owner: string;
  updated: string;
  insertions: number;
  deletions: number;
  files: ChangeFile[];
}

export interface ChangeFile {
  path: string;
  status: 'MODIFIED' | 'ADDED' | 'DELETED';
  content: string;
  oldContent?: string;
}

export interface AIReview {
  summary: string;
  suggestions: {
    line?: number;
    file: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}
