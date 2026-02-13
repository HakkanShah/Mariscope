export interface InitialBankEntry {
  shipId: string;
  year: number;
  entryType: 'bank' | 'apply';
  amount: number;
}

export const INITIAL_BANK_ENTRIES: InitialBankEntry[] = [
  {
    shipId: 'R002',
    year: 2024,
    entryType: 'bank',
    amount: 300_000,
  },
  {
    shipId: 'R004',
    year: 2025,
    entryType: 'bank',
    amount: 150_000,
  },
  {
    shipId: 'R003',
    year: 2024,
    entryType: 'apply',
    amount: 50_000,
  },
];
