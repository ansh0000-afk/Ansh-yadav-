export interface SubjectContent {
  id: string;
  name: string;
  code: string;
  iconName: string;
  color: string;
  description: string;
  chaptersCount: number;
  notes: {
    id: string;
    title: string;
    chapter: string;
    summary: string;
    keyPoints: string[];
    importantFormulaeOrTerms?: string[];
    isFavorite?: boolean;
  }[];
  questionBank: {
    id: string;
    chapter: string;
    question: string;
    answer: string;
    type: 'short' | 'long' | 'numerical';
    marks: number;
    isImportant?: boolean;
  }[];
  mcqs: {
    id: string;
    chapter: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
  samplePapers: {
    id: string;
    title: string;
    year: string;
    totalMarks: number;
    duration: string;
    downloadUrl?: string;
    sections: {
      sectionName: string;
      questionsCount: number;
      instructions: string;
    }[];
    solutions: string;
  }[];
  previousYearPapers: {
    id: string;
    year: string;
    board: string;
    title: string;
    totalMarks: number;
    solutionsSummary: string;
  }[];
}

export const MAHARASHTRA_BOARD_INFO = {
  boardName: 'Maharashtra State Board of Secondary & Higher Secondary Education (MSBSHSE)',
  className: 'Class 12 (HSC) Commerce',
  examMonth: 'February / March 2026',
  totalWrittenMarks: 80,
  internalMarks: 20,
  passingMarks: 35
};

export const CLASS_12_COMMERCE_SUBJECTS: SubjectContent[] = [
  {
    id: 'accountancy',
    name: 'Book Keeping & Accountancy',
    code: 'BK-51',
    iconName: 'Calculator',
    color: 'from-emerald-600 to-teal-700',
    description: 'Maharashtra HSC Board Syllabus: Partnership Final Accounts, NPO, Admission, Retirement, Death, Dissolution, Bills of Exchange, Share Capital & Company Accounts.',
    chaptersCount: 10,
    notes: [
      {
        id: 'bk-n1',
        title: 'Introduction to Partnership and Partnership Final Accounts',
        chapter: 'Chapter 1: Partnership Final Accounts',
        summary: 'Partnership is an agreement between persons who have agreed to share the profits of a business carried on by all or any of them acting for all (Indian Partnership Act 1932). Final Accounts consist of Trading A/c, Profit & Loss A/c, and Balance Sheet.',
        keyPoints: [
          'Trading Account: Shows Gross Profit or Gross Loss. Includes direct expenses like Wages, Carriage Inward, Freight, Factory Power.',
          'Profit & Loss Account: Shows Net Profit or Net Loss. Includes indirect expenses like Salaries, Rent, Discount Allowed, Bad Debts.',
          'Balance Sheet: Statement of Financial Position listing Assets and Liabilities as on a particular date.',
          'Important Adjustments: Closing Stock (cost or market price whichever is lower), Outstanding Expenses, Prepaid Expenses, Depreciation, Reserve for Doubtful Debts (RDD), Interest on Capital/Drawings.'
        ],
        importantFormulaeOrTerms: [
          'Gross Profit = Net Sales - Cost of Goods Sold',
          'Cost of Goods Sold = Opening Stock + Net Purchases + Direct Expenses - Closing Stock',
          'RDD Calculation = % on New Debtors (Debtors after deducting New Bad Debts)'
        ]
      },
      {
        id: 'bk-n2',
        title: "Accounts of 'Not for Profit' Concerns (NPO)",
        chapter: 'Chapter 2: NPO Accounts',
        summary: 'NPO concerns exist for service, not profit (e.g. Hospitals, Schools, Sports Clubs). They prepare Receipts & Payments A/c, Income & Expenditure A/c, and Balance Sheet.',
        keyPoints: [
          'Receipts & Payments Account: Real Account summary of Cash & Bank transactions (both Capital and Revenue).',
          'Income & Expenditure Account: Nominal Account prepared on accrual basis containing Revenue Income and Revenue Expenses of the CURRENT YEAR only.',
          'Capital Fund: Excess of Assets over Liabilities (Capital Fund = Total Assets - Total Outside Liabilities).',
          'Specific Revenue Items: Legacy (Capitalised), Life Membership Fees (Capitalised), Subscriptions (Revenue Income adjusted for outstanding/prepaid).'
        ],
        importantFormulaeOrTerms: [
          'Subscription Income for Current Year = Subscription Received + O/S Current Year - O/S Previous Year - Advance Current Year + Advance Previous Year',
          'Capital Fund = Opening Balance Sheet Assets - Opening Balance Sheet Liabilities'
        ]
      },
      {
        id: 'bk-n3',
        title: 'Admission of a Partner & Goodwill Adjustments',
        chapter: 'Chapter 3: Admission of Partner',
        summary: 'Reconstitution of partnership where a new partner enters the firm, bringing Capital and Goodwill. Requires valuation of goodwill and revaluation of assets/liabilities.',
        keyPoints: [
          'Sacrificing Ratio = Old Ratio - New Ratio. Used to distribute Goodwill brought by new partner in cash.',
          'Revaluation Account (Profit/Loss on Revaluation): Nominal Account. Increase in Asset & Decrease in Liability credited; Decrease in Asset & Increase in Liability debited.',
          'Goodwill Premium Method: New partner brings goodwill in cash (credited to Sacrifice Partners Capital A/c).',
          'Goodwill Valuation (Average Profit Method): Goodwill = Average Profit × Number of Years Purchase.'
        ],
        importantFormulaeOrTerms: [
          'New Profit Sharing Ratio = Old Ratio × Balance 1 (where Balance 1 = 1 - Share of New Partner)',
          'Super Profit = Average Profit - Normal Profit (where Normal Profit = Capital Employed × NRR / 100)'
        ]
      },
      {
        id: 'bk-n4',
        title: 'Bills of Exchange & Journal Entries',
        chapter: 'Chapter 7: Bill of Exchange',
        summary: 'A Bill of Exchange is an unconditional written order given by the Drawer to the Drawee to pay a certain sum of money on a specified date (Negotiable Instruments Act 1881).',
        keyPoints: [
          '3 Grace Days are added to the nominal due date to calculate the legal due date.',
          'Drawer: Person who draws the bill (Creditor). Drawee: Person on whom bill is drawn (Debtor). Payee: Person who receives payment.',
          '4 Treatments of Bill by Drawer: Retained till maturity, Discounted with Bank, Endorsed to Creditor, Sent to Bank for Collection.',
          'Dishonour of Bill: Drawee fails to make payment on due date. Noting Charges are paid to Notary Public.'
        ],
        importantFormulaeOrTerms: [
          'Legal Due Date = Date of Bill + Term of Bill + 3 Days Grace',
          'Discounting Charge = Bill Amount × (Rate/100) × (Unexpired Months/12)'
        ]
      },
      {
        id: 'bk-n5',
        title: 'Company Accounts - Issue of Shares',
        chapter: 'Chapter 8: Issue of Shares',
        summary: 'Shares are units of ownership in a Joint Stock Company. Issued at Par, Premium, or Discount through Application, Allotment, and Calls.',
        keyPoints: [
          'Pro-rata Allotment: Proportionate allotment when applications exceed shares offered.',
          'Calls in Arrears: Amount unpaid by shareholder on allotment/calls.',
          'Forfeiture of Shares: Cancellation of shares due to non-payment. Forfeited amount transferred to Share Forfeiture A/c.',
          'Reissue of Forfeited Shares: Maximum discount on reissue cannot exceed the amount forfeited on those shares. Balance transferred to Capital Reserve.'
        ],
        importantFormulaeOrTerms: [
          'Transfer to Capital Reserve = (Forfeited Amount per Share - Discount per Share on Reissue) × Number of Shares Reissued'
        ]
      }
    ],
    questionBank: [
      {
        id: 'bk-q1',
        chapter: 'Partnership Final Accounts',
        question: 'State any 4 adjustments required while preparing Partnership Final Accounts along with their dual effects.',
        answer: '1. Closing Stock: Debit Trading A/c & Credit Balance Sheet Asset side.\n2. Outstanding Expense: Add to respective expense in Trading/P&L A/c & Credit Balance Sheet Liability side.\n3. Prepaid Expense: Deduct from respective expense in Trading/P&L A/c & Debit Balance Sheet Asset side.\n4. Depreciation on Asset: Debit P&L A/c & Deduct from respective Asset in Balance Sheet.',
        type: 'short',
        marks: 4
      },
      {
        id: 'bk-q2',
        chapter: 'Bill of Exchange',
        question: 'Explain the journal entries in the books of Drawer and Drawee when a bill discounted with bank is dishonoured.',
        answer: 'In Drawer Books:\nDebit Drawee Account (with Bill Amount + Noting Charges)\nCredit Bank Account (with total amount paid to bank)\n\nIn Drawee Books:\nDebit Bills Payable Account\nDebit Noting Charges Account\nCredit Drawer Account.',
        type: 'long',
        marks: 6
      },
      {
        id: 'bk-q3',
        chapter: 'Issue of Shares',
        question: 'A company forfeited 100 shares of ₹10 each for non-payment of final call of ₹3 per share. Reissued them at ₹8 per share fully paid up. Pass journal entries for Forfeiture and Reissue.',
        answer: '1. Share Capital A/c Dr. ₹1,000\n   To Share Final Call A/c ₹300\n   To Share Forfeiture A/c ₹700\n(Being 100 shares forfeited for non-payment of call)\n\n2. Bank A/c Dr. ₹800\n   Share Forfeiture A/c Dr. ₹200\n   To Share Capital A/c ₹1,000\n(Being 100 forfeited shares reissued at ₹8)\n\n3. Share Forfeiture A/c Dr. ₹500\n   To Capital Reserve A/c ₹500\n(Being gain on reissue transferred to Capital Reserve: ₹700 - ₹200 = ₹500).',
        type: 'numerical',
        marks: 8
      }
    ],
    mcqs: [
      {
        id: 'bk-m1',
        chapter: 'Partnership Final Accounts',
        question: 'In the absence of a Partnership Deed, profit or loss of the firm is shared among partners in which ratio?',
        options: ['Capital Ratio', 'Equal Ratio', 'Ratio of Drawings', 'As decided by Senior Partner'],
        correctAnswerIndex: 1,
        explanation: 'According to Indian Partnership Act 1932, in the absence of an express agreement or deed, profits and losses are shared EQUALLY among partners.'
      },
      {
        id: 'bk-m2',
        chapter: 'NPO Accounts',
        question: 'Income and Expenditure Account is a:',
        options: ['Real Account', 'Personal Account', 'Nominal Account', 'Capital Account'],
        correctAnswerIndex: 2,
        explanation: 'Income & Expenditure Account is a Nominal Account (Debit all expenses and losses, Credit all incomes and gains).'
      },
      {
        id: 'bk-m3',
        chapter: 'Bill of Exchange',
        question: 'How many grace days are added to nominal due date to calculate legal due date of a bill of exchange?',
        options: ['2 Days', '3 Days', '5 Days', '7 Days'],
        correctAnswerIndex: 1,
        explanation: 'Under Negotiable Instruments Act 1881, 3 grace days are legally required to be added.'
      },
      {
        id: 'bk-m4',
        chapter: 'Issue of Shares',
        question: 'The maximum discount that can be allowed on reissue of forfeited shares is equal to:',
        options: ['10% of Nominal Value', 'Amount already collected on forfeited shares', '50% of Face Value', 'No discount allowed'],
        correctAnswerIndex: 1,
        explanation: 'The discount on reissue cannot exceed the amount already forfeited on those specific shares.'
      }
    ],
    samplePapers: [
      {
        id: 'bk-sp1',
        title: 'Maharashtra HSC Board BK Model Question Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'Q.1 Objective Questions (MCQs, One Word, True/False, Bill Format)', questionsCount: 20, instructions: 'All sub-questions compulsory (20 Marks).' },
          { sectionName: 'Q.2 / Q.3 Admission / Retirement / Dissolution / Bill of Exchange', questionsCount: 4, instructions: 'Solve any 2 long practical problems (20 Marks).' },
          { sectionName: 'Q.4 / Q.5 Issue of Shares / Analysis / Computer Accounting', questionsCount: 4, instructions: 'Solve any 2 problems (16 Marks).' },
          { sectionName: 'Q.6 NPO Accounts Problem', questionsCount: 1, instructions: 'Compulsory 12 Marks problem.' },
          { sectionName: 'Q.7 Partnership Final Accounts Problem', questionsCount: 1, instructions: 'Compulsory 12 Marks problem.' }
        ],
        solutions: 'Full step-by-step solutions with Ledger Formats, Working Notes, Journal Entries, and Balance Sheets as per Balbharati textbook standard.'
      }
    ],
    previousYearPapers: [
      {
        id: 'bk-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Book Keeping & Accountancy Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC Board exam paper with official Board Moderator Answer Key and step-by-step working notes.'
      },
      {
        id: 'bk-pyp2',
        year: 'July 2023',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Book Keeping & Accountancy Supplementary Paper July 2023',
        totalMarks: 80,
        solutionsSummary: 'Complete July 2023 Supplementary Board exam paper with solutions.'
      }
    ]
  },
  {
    id: 'ocm',
    name: 'Organisation of Commerce & Management (OCM)',
    code: 'OCM-50',
    iconName: 'Building2',
    color: 'from-amber-600 to-orange-700',
    description: 'Maharashtra HSC Board Syllabus: Principles of Management, Functions, Entrepreneurship, Business Services, Emerging Modes, Social Responsibility, Consumer Protection & Marketing.',
    chaptersCount: 8,
    notes: [
      {
        id: 'ocm-n1',
        title: 'Principles of Management (Henri Fayol 14 Principles & F.W. Taylor)',
        chapter: 'Chapter 1: Principles of Management',
        summary: 'Management principles are fundamental truths serving as guidelines for decision making. Henri Fayol is the Father of Modern Management (14 Principles), while F.W. Taylor introduced Scientific Management.',
        keyPoints: [
          'Henri Fayol 14 Principles: Division of Work, Authority & Responsibility, Discipline, Unity of Command, Unity of Direction, Subordination of Individual Interest, Remuneration, Centralisation, Scalar Chain, Order, Equity, Stability of Tenure, Initiative, Esprit de Corps.',
          'Scalar Chain: Hierarchy of authority from highest to lowest rank. Gang Plank allows direct communication between same levels in emergencies.',
          'F.W. Taylor Scientific Management Techniques: Work Study (Time, Motion, Fatigue, Method Study), Differential Piece Rate Wage System, Functional Foremanship.'
        ],
        importantFormulaeOrTerms: [
          'Gang Plank = Direct emergency communication path bypassing scalar chain hierarchy.',
          'Esprit de Corps = Team spirit and harmony among employees.'
        ]
      },
      {
        id: 'ocm-n2',
        title: 'Functions of Management (Planning to Controlling)',
        chapter: 'Chapter 2: Functions of Management',
        summary: 'Management is a process involving Planning, Organising, Staffing, Directing, Co-ordinating, and Controlling (POSDCORB).',
        keyPoints: [
          'Planning: Primary function. Deciding in advance what to do, how to do, when to do, and who is to do it.',
          'Organising: Grouping activities and assigning duties to create organizational structure.',
          'Staffing: Recruitment, selection, training, and development of human resources (Right person for right job).',
          'Directing: Guiding, supervising, inspiring, and leading employees (Leadership, Communication, Motivation).',
          'Co-ordinating: Integrating activities of different departments for unity of action (Soul of management).',
          'Controlling: Measuring actual performance against set standards and taking corrective measures.'
        ]
      },
      {
        id: 'ocm-n3',
        title: 'Business Services (Banking, Insurance, Transport, Warehousing)',
        chapter: 'Chapter 4: Business Services',
        summary: 'Intangible activities providing support to commerce and industry: Banking, Insurance, Transport, Warehousing, and Communication.',
        keyPoints: [
          'Types of Banks: Commercial Banks, Co-operative Banks, Specialised Banks (EXIM, NABARD, SIDBI), Central Bank (RBI).',
          'Principles of Insurance: Utmost Good Faith (Uberrimae Fidei), Insurable Interest, Indemnity, Subrogation, Contribution, Mitigation of Loss, Causa Proxima (Proximate Cause).',
          'Types of Warehouses: Private, Public, Bonded (customs duty unpaid goods), Duty Paid, Government, Co-operative Warehouses.'
        ]
      },
      {
        id: 'ocm-n4',
        title: 'Consumer Protection Act 2019 & Rights',
        chapter: 'Chapter 7: Consumer Protection',
        summary: 'Consumer Protection Act 2019 safeguards consumer rights against unfair trade practices. Establishes a 3-tier Redressal Mechanism.',
        keyPoints: [
          '6 Basic Consumer Rights: Right to Safety, Right to Information, Right to Choose, Right to be Heard, Right to Redressal, Right to Consumer Education.',
          'District Commission: Claims up to ₹1 Crore.',
          'State Commission: Claims above ₹1 Crore up to ₹10 Crore.',
          'National Commission: Claims exceeding ₹10 Crore.'
        ]
      }
    ],
    questionBank: [
      {
        id: 'ocm-q1',
        chapter: 'Principles of Management',
        question: 'Explain any 5 principles of management stated by Henri Fayol.',
        answer: '1. Division of Work: Work divided into small tasks for specialization.\n2. Unity of Command: An employee should receive orders from ONLY ONE superior.\n3. Unity of Direction: One head and one plan for a group of activities with same objective.\n4. Scalar Chain: Chain of authority from top level to lower level.\n5. Esprit de Corps: Promoting team spirit and unity among workers.',
        type: 'long',
        marks: 8
      },
      {
        id: 'ocm-q2',
        chapter: 'Business Services',
        question: 'Distinguish between Commercial Bank and Central Bank (RBI).',
        answer: '1. Meaning: Commercial bank operates for profit providing banking services to public. Central Bank (RBI) is apex bank regulating monetary system.\n2. Note Issue: Central Bank has sole monopoly to issue currency notes. Commercial banks cannot issue currency.\n3. Public Relationship: Commercial bank directly deals with public. Central bank deals with government and other banks.\n4. Profit Motive: Commercial bank works for profit. Central bank works for public interest and economic stability.',
        type: 'short',
        marks: 4
      }
    ],
    mcqs: [
      {
        id: 'ocm-m1',
        chapter: 'Principles of Management',
        question: 'Who is known as the Father of Modern Management?',
        options: ['F.W. Taylor', 'Henri Fayol', 'Philip Kotler', 'Adam Smith'],
        correctAnswerIndex: 1,
        explanation: 'Henri Fayol is recognized as the Father of Modern Management for his 14 principles.'
      },
      {
        id: 'ocm-m2',
        chapter: 'Consumer Protection',
        question: 'Under Consumer Protection Act 2019, District Commission can entertain claims up to:',
        options: ['₹20 Lakhs', '₹50 Lakhs', '₹1 Crore', '₹10 Crore'],
        correctAnswerIndex: 2,
        explanation: 'Under Consumer Protection Act 2019, District Commission handles claims up to ₹1 Crore.'
      }
    ],
    samplePapers: [
      {
        id: 'ocm-sp1',
        title: 'Maharashtra HSC Board OCM Model Question Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'Q.1 Objectives (Select Option, Match Terms, True/False, One Word)', questionsCount: 20, instructions: 'Compulsory 20 Marks.' },
          { sectionName: 'Q.2 Explain Concepts / Terms', questionsCount: 6, instructions: 'Solve any 4 out of 6 (8 Marks).' },
          { sectionName: 'Q.3 Study Case / Situation', questionsCount: 3, instructions: 'Solve any 2 out of 3 (6 Marks).' },
          { sectionName: 'Q.4 Distinguish Between', questionsCount: 4, instructions: 'Solve any 3 out of 4 (12 Marks).' },
          { sectionName: 'Q.5 Answer in Brief', questionsCount: 3, instructions: 'Solve any 2 out of 3 (8 Marks).' },
          { sectionName: 'Q.6 Justify Statements', questionsCount: 4, instructions: 'Solve any 2 out of 4 (8 Marks).' },
          { sectionName: 'Q.7 Attempt Long Questions', questionsCount: 2, instructions: 'Solve any 1 out of 2 (10 Marks).' },
          { sectionName: 'Q.8 Answer in Detail', questionsCount: 2, instructions: 'Solve any 1 out of 2 (8 Marks).' }
        ],
        solutions: 'Full HSC Board standard answers with clear headings, sub-points, and textbook diagrams.'
      }
    ],
    previousYearPapers: [
      {
        id: 'ocm-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board OCM Exam Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC Board paper with model answers and marking scheme.'
      }
    ]
  },
  {
    id: 'economics',
    name: 'Economics',
    code: 'ECO-49',
    iconName: 'TrendingUp',
    color: 'from-blue-600 to-indigo-700',
    description: 'Maharashtra HSC Board Syllabus: Micro & Macro Economics, Utility, Demand & Elasticity, Supply, Market Forms, Index Numbers, National Income, Public Finance & Money Market.',
    chaptersCount: 10,
    notes: [
      {
        id: 'eco-n1',
        title: 'Utility Analysis & Law of Diminishing Marginal Utility (DMU)',
        chapter: 'Chapter 2: Utility Analysis',
        summary: 'Utility is the want-satisfying power of a commodity. Law of DMU states that as a consumer consumes more units of a commodity, the marginal utility derived from each additional unit goes on diminishing.',
        keyPoints: [
          'Total Utility (TU): Sum total of utility derived from all units consumed.',
          'Marginal Utility (MU): Additional utility derived from consuming one more unit.',
          'Point of Satiety: Point where TU is maximum and MU is ZERO. Beyond this, MU becomes negative (disutility).',
          'Assumptions of Law of DMU: Rationality, Homogeneity, Continuity, Reasonability, Constancy of Marginal Utility of Money, Single Want.'
        ],
        importantFormulaeOrTerms: [
          'MU_n = TU_n - TU_(n-1)',
          'Equilibrium Condition: MU_x / P_x = MU_m'
        ]
      },
      {
        id: 'eco-n2',
        title: 'Demand Analysis & Elasticity of Demand (Price, Income, Cross)',
        chapter: 'Chapter 3: Demand & Elasticity of Demand',
        summary: 'Demand is desire backed by ability and willingness to pay. Law of Demand: Inversely related to price. Price Elasticity measures responsiveness of quantity demanded to price change.',
        keyPoints: [
          'Law of Demand: Other things remaining constant, higher price leads to lower demand and vice versa.',
          'Exceptions to Law of Demand: Giffen Paradox (inferior goods), Prestige goods, Speculation, Price Illusion, Habitual goods.',
          'Types of Price Elasticity: Perfectly Elastic (Ed = ∞), Perfectly Inelastic (Ed = 0), Unitary Elastic (Ed = 1), Relatively Elastic (Ed > 1), Relatively Inelastic (Ed < 1).',
          'Methods of Measuring Price Elasticity: Ratio/Percentage Method, Total Outlay Method, Geometric/Point Method.'
        ],
        importantFormulaeOrTerms: [
          'Price Elasticity (Ed) = (% Change in Quantity Demanded) / (% Change in Price) = (ΔQ/Q) × (P/ΔP)',
          'Point Elasticity = Lower Segment of Demand Curve / Upper Segment of Demand Curve'
        ]
      },
      {
        id: 'eco-n3',
        title: 'National Income Accounting & Methods of Measurement',
        chapter: 'Chapter 7: National Income',
        summary: 'National Income is the total money value of all final goods and services produced in a country during one financial year.',
        keyPoints: [
          '3 Methods of Measuring National Income: Output/Product Method, Income Method, Expenditure Method.',
          'Output Method: Gross Value Added = Gross Value of Output - Intermediate Consumption.',
          'Income Method: NI = Rent + Wages + Interest + Profit + Mixed Income + Net Factor Income from Abroad.',
          'Expenditure Method: NI = C + I + G + (X - M).',
          'Difficulties in Measurement: Theoretical (Transfer payments, Illegal income, Unpaid service) & Practical (Double counting, Depreciation valuation, Lack of records).'
        ],
        importantFormulaeOrTerms: [
          'GNP = GDP + NFIA',
          'NNP at Market Price = GNP - Depreciation',
          'NNP at Factor Cost (National Income) = NNP at MP - Indirect Taxes + Subsidies'
        ]
      }
    ],
    questionBank: [
      {
        id: 'eco-q1',
        chapter: 'Utility Analysis',
        question: 'State and explain the Law of Diminishing Marginal Utility with assumptions and exceptions.',
        answer: 'Statement: According to Prof. Alfred Marshall, "Other things remaining constant, the additional benefit which a person derives from a given increase of his stock of a thing diminishes with every increase in the stock that he already has."\nAssumptions: Rational consumer, Homogeneous units, Continuous consumption, Reasonable size.\nExceptions: Hobbies, Miser, Music/Reading, Addiction, Money.',
        type: 'long',
        marks: 8
      },
      {
        id: 'eco-q2',
        chapter: 'National Income',
        question: 'Calculate National Income using Expenditure Method if C = ₹500 Cr, I = ₹200 Cr, G = ₹150 Cr, Exports = ₹50 Cr, Imports = ₹30 Cr.',
        answer: 'Formula: National Income = C + I + G + (X - M)\nC = 500\nI = 200\nG = 150\n(X - M) = 50 - 30 = 20 Cr\nNational Income = 500 + 200 + 150 + 20 = ₹870 Crores.',
        type: 'numerical',
        marks: 4
      }
    ],
    mcqs: [
      {
        id: 'eco-m1',
        chapter: 'Utility Analysis',
        question: 'At the point of satiety, Marginal Utility (MU) is:',
        options: ['Maximum', 'Zero', 'Negative', 'Infinite'],
        correctAnswerIndex: 1,
        explanation: 'At the point of satiety, total utility is maximum and marginal utility becomes exactly ZERO.'
      },
      {
        id: 'eco-m2',
        chapter: 'National Income',
        question: 'Net National Product (NNP) at Factor Cost is also known as:',
        options: ['Gross Domestic Product', 'National Income', 'Personal Income', 'Disposable Income'],
        correctAnswerIndex: 1,
        explanation: 'NNP at Factor Cost represents the actual National Income of a country.'
      }
    ],
    samplePapers: [
      {
        id: 'eco-sp1',
        title: 'Maharashtra HSC Board Economics Model Question Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'Q.1 Objective Questions', questionsCount: 20, instructions: 'Compulsory 20 Marks.' },
          { sectionName: 'Q.2 Identify and Explain Concepts / Distinguish Between', questionsCount: 6, instructions: 'Attempt any 3 (12 Marks).' },
          { sectionName: 'Q.3 Answer in Short', questionsCount: 5, instructions: 'Attempt any 3 (12 Marks).' },
          { sectionName: 'Q.4 State with Reasons whether Agree or Disagree', questionsCount: 5, instructions: 'Attempt any 3 (12 Marks).' },
          { sectionName: 'Q.5 Study Table / Diagram / Passage', questionsCount: 3, instructions: 'Attempt any 2 (8 Marks).' },
          { sectionName: 'Q.6 Answer in Detail (8 Marks Questions)', questionsCount: 3, instructions: 'Attempt any 2 out of 3 (16 Marks).' }
        ],
        solutions: 'Includes full micro/macro diagrams, law of demand & DMU schedules, and numerical steps.'
      }
    ],
    previousYearPapers: [
      {
        id: 'eco-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Economics Exam Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC Board exam paper with official Board answer key.'
      }
    ]
  },
  {
    id: 'sp',
    name: 'Secretarial Practice (SP)',
    code: 'SP-52',
    iconName: 'FileCheck',
    color: 'from-purple-600 to-pink-700',
    description: 'Maharashtra HSC Board Syllabus: Corporate Finance, Sources of Capital, Issue of Shares/Debentures/Deposits, Secretarial Correspondence, Depository System, Stock Exchange.',
    chaptersCount: 12,
    notes: [
      {
        id: 'sp-n1',
        title: 'Corporate Finance & Capital Structure',
        chapter: 'Chapter 1: Corporate Finance',
        summary: 'Corporate finance deals with raising and utilizing finance by a corporation. Fixed Capital is needed for long-term assets, Working Capital for day-to-day operations.',
        keyPoints: [
          'Fixed Capital Factors: Nature of business, size of business, scope of business, lease vs purchase.',
          'Working Capital Factors: Nature of business, terms of credit, business cycle, seasonal requirement.',
          'Capital Structure: Mix of owned capital (Equity, Preference, Retained Earnings) and borrowed capital (Debentures, Loans, Deposits).'
        ]
      },
      {
        id: 'sp-n2',
        title: 'Secretarial Correspondence with Members, Debentureholders & Depositors',
        chapter: 'Chapter 6, 7 & 8: Secretarial Letters',
        summary: 'Format of official letters written by Company Secretary to Shareholders, Debentureholders, and Fixed Deposit holders.',
        keyPoints: [
          'Letter to Shareholder regarding Allotment of Shares / Dividend Warrant / Electronic Dividend.',
          'Letter to Debentureholder regarding Allotment of Debentures / Payment of Interest.',
          'Letter to Depositor regarding Renewal / Repayment of Deposit.',
          'Mandatory Components: Letterhead, Ref No, Date, Inside Address, Subject, Salutation, Body, Complementary Close, Signature.'
        ]
      },
      {
        id: 'sp-n3',
        title: 'Depository System (NSDL & CDSL)',
        chapter: 'Chapter 9: Depository System',
        summary: 'Depository system holds securities in electronic (dematerialized) form, eliminating physical certificates.',
        keyPoints: [
          'Demat (Dematerialisation): Converting physical share certificates into electronic holding.',
          'Remat (Rematerialisation): Converting electronic securities back into physical share certificates.',
          '4 Constituents: Depository (NSDL/CDSL), Depository Participant (DP like Banks/Brokers), Beneficial Owner (Investor), Issuer Company.'
        ]
      }
    ],
    questionBank: [
      {
        id: 'sp-q1',
        chapter: 'Secretarial Letters',
        question: 'Draft a letter to a shareholder informing about the allotment of shares.',
        answer: 'Title: XYZ Company Ltd Letterhead\nRef No: S/102/2026 | Date: 10th March 2026\nTo: Mr. Ramesh Patil, Mumbai\nSubject: Allotment of Equity Shares\n\nDear Sir,\nIn response to your application No. 4521, we are pleased to inform you that the Board of Directors has allotted 100 Equity Shares of ₹10 each to you as per Board Resolution dated 8th March 2026.\n\nDetails of Allotment:\n- Application No: 4521\n- Shares Applied: 100 | Shares Allotted: 100\n- Distinctive Nos: 1001 to 1100\n- Amount Due on Allotment: ₹500 (₹5 per share)\n\nPlease pay the allotment money before 31st March 2026.\n\nThanking You,\nYours faithfully,\nFor XYZ Company Ltd,\n(Company Secretary)',
        type: 'long',
        marks: 5
      }
    ],
    mcqs: [
      {
        id: 'sp-m1',
        chapter: 'Depository System',
        question: 'The process of converting physical share certificates into electronic format is called:',
        options: ['Rematerialisation', 'Dematerialisation', 'Allotment', 'Forfeiture'],
        correctAnswerIndex: 1,
        explanation: 'Dematerialisation (Demat) is the process of converting physical certificates into electronic form.'
      }
    ],
    samplePapers: [
      {
        id: 'sp-sp1',
        title: 'Maharashtra HSC Board SP Model Question Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'Q.1 Objectives', questionsCount: 20, instructions: '20 Marks.' },
          { sectionName: 'Q.2 Terms / Concepts', questionsCount: 4, instructions: '8 Marks.' },
          { sectionName: 'Q.3 Case Studies', questionsCount: 2, instructions: '6 Marks.' },
          { sectionName: 'Q.4 Distinguish Between', questionsCount: 3, instructions: '12 Marks.' },
          { sectionName: 'Q.5 Secretarial Letters (Drafting)', questionsCount: 2, instructions: '10 Marks.' },
          { sectionName: 'Q.6 Long Questions', questionsCount: 2, instructions: '16 Marks.' },
          { sectionName: 'Q.7 Detail Answer', questionsCount: 1, instructions: '8 Marks.' }
        ],
        solutions: 'Complete secretarial letter formats and board model answers.'
      }
    ],
    previousYearPapers: [
      {
        id: 'sp-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Secretarial Practice Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC Board exam paper with solutions.'
      }
    ]
  },
  {
    id: 'maths',
    name: 'Mathematics & Statistics (Commerce)',
    code: 'MATH-88',
    iconName: 'Percent',
    color: 'from-cyan-600 to-blue-700',
    description: 'Maharashtra HSC Board Syllabus: Logic, Matrices, Derivatives, Integration, LPP, Commission Brokerage, Insurance & Annuity, Time Series & Regression.',
    chaptersCount: 16,
    notes: [
      {
        id: 'math-n1',
        title: 'Mathematical Logic & Truth Tables',
        chapter: 'Part 1 - Chapter 1: Logic',
        summary: 'Statements, Logical Connectives (And ∧, Or ∨, If-then →, If and only if ↔, Negation ~), Truth Tables, Tautology, Contradiction, and Duals.',
        keyPoints: [
          'Conjunction (p ∧ q) is TRUE only when BOTH statements are True.',
          'Disjunction (p ∨ q) is FALSE only when BOTH statements are False.',
          'Conditional (p → q) is FALSE only when p is True and q is False.',
          'Biconditional (p ↔ q) is TRUE when both have SAME truth value.',
          'Tautology: All entries in last column of truth table are True (T). Contradiction: All entries are False (F).'
        ],
        importantFormulaeOrTerms: [
          'p → q ≡ ~p ∨ q',
          'De Morgan Laws: ~(p ∧ q) ≡ ~p ∨ ~q and ~(p ∨ q) ≡ ~p ∧ ~q'
        ]
      },
      {
        id: 'math-n2',
        title: 'Commission, Brokerage, Discount & Annuity',
        chapter: 'Part 2 - Chapter 1 & 2: Financial Mathematics',
        summary: 'Commercial math calculations for Agents, Principal, Trade Discount, Cash Discount, Present Value, Bill Discounting, and Annuities.',
        keyPoints: [
          'Agent Commission = Sales Amount × Rate of Commission / 100.',
          'Trade Discount deducted from List Price to get Net Selling Price. Cash Discount deducted for immediate payment.',
          'True Discount (TD) = Interest on Present Value for unexpired period.',
          'Banker Discount (BD) = Interest on Face Value of Bill for unexpired period.',
          'Banker Gain (BG) = BD - TD = Interest on True Discount.'
        ],
        importantFormulaeOrTerms: [
          'BD = SD × n × r / 100',
          'TD = PW × n × r / 100',
          'BG = BD - TD = TD × n × r / 100'
        ]
      }
    ],
    questionBank: [
      {
        id: 'math-q1',
        chapter: 'Logic',
        question: 'Construct truth table for (p ∧ ~q) → (p ∨ q) and determine whether it is a tautology.',
        answer: 'Truth Table:\np | q | ~q | p ∧ ~q | p ∨ q | (p ∧ ~q) → (p ∨ q)\nT | T |  F |   F    |   T   |         T\nT | F |  T |   T    |   T   |         T\nF | T |  F |   F    |   T   |         T\nF | F |  T |   F    |   F   |         T\nSince all values in the last column are T, the statement is a TAUTOLOGY.',
        type: 'short',
        marks: 3
      }
    ],
    mcqs: [
      {
        id: 'math-m1',
        chapter: 'Logic',
        question: 'The negation of (p ∧ q) according to De Morgan Law is:',
        options: ['~p ∧ ~q', '~p ∨ ~q', 'p ∨ q', '~p → ~q'],
        correctAnswerIndex: 1,
        explanation: 'De Morgan Law states that ~(p ∧ q) ≡ ~p ∨ ~q.'
      }
    ],
    samplePapers: [
      {
        id: 'math-sp1',
        title: 'Maharashtra HSC Board Math & Stats Model Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'Section A: MCQs & Short Answer', questionsCount: 12, instructions: '12 Marks.' },
          { sectionName: 'Section B: Part 1 & Part 2 Problems (2 Marks)', questionsCount: 8, instructions: '16 Marks.' },
          { sectionName: 'Section C: Part 1 & Part 2 Problems (3 Marks)', questionsCount: 8, instructions: '24 Marks.' },
          { sectionName: 'Section D: Long Problems (4 Marks)', questionsCount: 7, instructions: '28 Marks.' }
        ],
        solutions: 'Step-by-step mathematical derivations, logic truth tables, and linear programming graph solutions.'
      }
    ],
    previousYearPapers: [
      {
        id: 'math-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Math & Stats Exam Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC Board exam paper with solutions.'
      }
    ]
  },
  {
    id: 'english',
    name: 'English (Yuvakbharati)',
    code: 'ENG-01',
    iconName: 'BookOpen',
    color: 'from-rose-600 to-red-700',
    description: 'Maharashtra HSC Board Syllabus: Prose Lessons, Poetry Appreciation, Writing Skills (Mind Map, Summary, Interview, Email), Novel & Drama section.',
    chaptersCount: 16,
    notes: [
      {
        id: 'eng-n1',
        title: 'An Astrologer\'s Day (R.K. Narayan) - Chapter Summary & Character Sketch',
        chapter: 'Prose 1.1: An Astrologer\'s Day',
        summary: 'Set in Malgudi, an astrologer with pseudo-knowledge sits under a tamarind tree. Guru Nayak comes seeking the man who once stabbed him. The astrologer recognizes him as the man he himself stabbed years ago in his village and tricks him into believing his enemy is dead.',
        keyPoints: [
          'Themes: Irony, Fate, Human Fraudulence, Survival Tactics.',
          'Astrologer Equipment: Cowrie shells, square cloth with obscure charts, palmyra writing.',
          'Climax: Astrologer tells Guru Nayak his enemy died under a lorry 4 months ago, granting him peace and saving himself.'
        ]
      },
      {
        id: 'eng-n2',
        title: 'HSC Board Writing Skills Formats (Mind Mapping, Email, Summary, Speech)',
        chapter: 'Section 3: Writing Skills',
        summary: 'Standard layouts for 4-mark writing skill questions in HSC English Board Exam.',
        keyPoints: [
          'Mind Mapping: Central topic box surrounded by branch nodes and sub-nodes with concise keywords.',
          'Email Writing: To, Subject, Formal Salutation, Clear Paragraphs, Sign-off.',
          'Summary Writing: Suitable Title + 1/3rd length summary of given passage without losing key message.',
          'Interview Questions: Frame 8 to 10 structured questions with introductory & concluding remarks.'
        ]
      }
    ],
    questionBank: [
      {
        id: 'eng-q1',
        chapter: 'Writing Skills',
        question: 'Draft 8 interview questions to interview a successful Young Commerce Entrepreneur for a student magazine.',
        answer: '1. Welcome to our college campus! How does it feel to be back as a successful young entrepreneur?\n2. What inspired you to start your own E-Commerce venture right after Class 12?\n3. What initial financial and operational challenges did you face?\n4. How did your Class 12 Commerce subjects (OCM & BK) help you in practical business management?\n5. How do you handle competition in today\'s digital market?\n6. What role did digital marketing and technology play in your growth?\n7. How do you maintain work-life balance at such a young age?\n8. What key message or advice would you give to current Class 12 Commerce students?',
        type: 'short',
        marks: 4
      }
    ],
    mcqs: [
      {
        id: 'eng-m1',
        chapter: 'An Astrologer\'s Day',
        question: 'Who wrote the short story "An Astrologer\'s Day"?',
        options: ['Mulak Raj Anand', 'R.K. Narayan', 'A.G. Gardiner', 'Joseph Conrad'],
        correctAnswerIndex: 1,
        explanation: 'R.K. Narayan is the author of "An Astrologer\'s Day".'
      }
    ],
    samplePapers: [
      {
        id: 'eng-sp1',
        title: 'Maharashtra HSC Board English Model Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'Section I: Prose (Reading for Comprehension, Grammar)', questionsCount: 34, instructions: '34 Marks.' },
          { sectionName: 'Section II: Poetry (Comprehension & Poetic Appreciation)', questionsCount: 14, instructions: '14 Marks.' },
          { sectionName: 'Section III: Writing Skills (Summary, Mind Map, Drafting)', questionsCount: 16, instructions: '16 Marks.' },
          { sectionName: 'Section IV: Literary Genre - Novel (4.1 to 4.4)', questionsCount: 16, instructions: '16 Marks.' }
        ],
        solutions: 'Complete English paper solutions including passage answers, grammar transforms, writing skills, and novel answers.'
      }
    ],
    previousYearPapers: [
      {
        id: 'eng-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board English Exam Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC English Board exam paper with official solutions.'
      }
    ]
  },
  {
    id: 'marathi',
    name: 'Marathi (युवकभारती)',
    code: 'MAR-02',
    iconName: 'Languages',
    color: 'from-amber-600 to-yellow-600',
    description: 'महाराष्ट्र राज्य माध्यमिक व उच्च माध्यमिक शिक्षण मंडळ इयत्ता १२ वी वाणिज्य: गद्य, पद्य, कथा, उपयोजित मराठी व व्याकरण.',
    chaptersCount: 14,
    notes: [
      {
        id: 'mar-n1',
        title: 'उपयोजित मराठी: मुलाखत, माहितीपत्रक, अहवाल लेखन व वृत्तलेख',
        chapter: 'भाग ४: उपयोजित मराठी',
        summary: 'इयत्ता १२ वी मराठी विषय उपयोजित विभागातील मुलाखत लेखन, माहितीपत्रक रचना व अहवाल लेखनाचे नियम व नमुने.',
        keyPoints: [
          'मुलाखत: प्रस्तावना, मध्य (प्रश्नावली) व समारोप. मुलाखत घेताना पाळावयाची दक्षता.',
          'माहितीपत्रक: आकर्षक शीर्षक, स्पष्ट व सोपी भाषा, उत्पादनाची वैशिष्ट्ये व पत्ता.',
          'अहवाल लेखन: कार्यक्रमाचे ठिकाण, तारीख, प्रमुख पाहुणे, कार्यक्रम वृत्त व निष्पत्ती.'
        ]
      }
    ],
    questionBank: [
      {
        id: 'mar-q1',
        chapter: 'उपयोजित मराठी',
        question: 'माहितीपत्रक म्हणजे काय? माहितीपत्रकाची मुख्य वैशिष्ट्ये स्पष्ट करा.',
        answer: 'माहितीपत्रक म्हणजे कोणत्याही नवीन उत्पादन, संस्था किंवा सेवेची सविस्तर व आकर्षक माहिती लोकांपर्यंत पोहोचवणारे पत्रक होय.\nवैशिष्ट्ये:\n१. भाषेचे सौंदर्य व सुलभता\n२. आकर्षक मांडणी व छपाई\n३. माहितीची अचूकता\n४. संपर्क पत्ता व माहिती.',
        type: 'short',
        marks: 4
      }
    ],
    mcqs: [
      {
        id: 'mar-m1',
        chapter: 'उपयोजित मराठी',
        question: 'एखाद्या कार्यक्रमाचे सविस्तर वर्णन करणारा वस्तुनिष्ठ मजकूर म्हणजे काय?',
        options: ['माहितीपत्रक', 'अहवाल', 'मुलाखत', 'जाहिरात'],
        correctAnswerIndex: 1,
        explanation: 'कार्यक्रमाचे वस्तुनिष्ठ वर्णन म्हणजेच अहवाल (Report) होय.'
      }
    ],
    samplePapers: [
      {
        id: 'mar-sp1',
        title: 'महाराष्ट्र इयत्ता १२ वी मराठी बोर्ड नमुना प्रश्नपत्रिका २०२६',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'विभाग १: गद्य', questionsCount: 20, instructions: '२० गुण' },
          { sectionName: 'विभाग २: पद्य', questionsCount: 16, instructions: '१६ गुण' },
          { sectionName: 'विभाग ३: कथा', questionsCount: 10, instructions: '१० गुण' },
          { sectionName: 'विभाग ४: उपयोजित मराठी', questionsCount: 14, instructions: '१४ गुण' },
          { sectionName: 'विभाग ५: व्याकरण व लेखन', questionsCount: 20, instructions: '२० गुण' }
        ],
        solutions: 'बोर्ड उत्तरपत्रिकेनुसार परिपूर्ण उत्तरे.'
      }
    ],
    previousYearPapers: [
      {
        id: 'mar-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Marathi Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'मार्च २०२४ मधील एचएससी बोर्ड मराठी प्रश्नपत्रिका व सविस्तर उत्तरे.'
      }
    ]
  },
  {
    id: 'hindi',
    name: 'Hindi (युवकभारती)',
    code: 'HIN-04',
    iconName: 'Sparkles',
    color: 'from-orange-600 to-amber-700',
    description: 'महाराष्ट्र राज्य बोर्ड कक्षा १२वीं वाणिज्य: गद्य, पद्य, व्यावहारिक हिंदी, विशेष अध्ययन (कनुप्रिया) एवं व्याकरण।',
    chaptersCount: 12,
    notes: [
      {
        id: 'hin-n1',
        title: 'व्यावहारिक हिंदी: ब्लॉग लेखन, फीचर लेखन एवं पल्लवन',
        chapter: 'भाग ३: व्यावहारिक हिंदी',
        summary: 'कक्षा १२वीं हिंदी व्यावहारिक विभाग के अंतर्गत ब्लॉग लेखन, फीचर लेखन, समाचार पत्र एवं पल्लवन की विस्तृत जानकारी।',
        keyPoints: [
          'ब्लॉग लेखन: डिजिटल माध्यम पर अपने विचारों को सरल, रोचक एवं सुगम भाषा में प्रस्तुत करना।',
          'फीचर लेखन: समसामयिक विषय पर रोचक, मनोरंजक एवं तथ्यात्मक आलेख।',
          'पल्लवन: किसी सुक्ति, कहावत या भाव-बिंदु का विस्तारपूर्वक व्याख्यान करना।'
        ]
      }
    ],
    questionBank: [
      {
        id: 'hin-q1',
        chapter: 'व्यावहारिक हिंदी',
        question: 'ब्लॉग लेखन से क्या तात्पर्य है? इसके प्रमुख लाभ लिखिए।',
        answer: 'ब्लॉग (Blog) शब्द वेबलॉग (Weblog) का संक्षिप्त रूप है। यह एक ऐसा डिजिटल मंच है जहाँ व्यक्ति अपने विचार, अनुभव एवं ज्ञान को इंटरनेट पर साझा करता है।\nलाभ:\n१. अपने विचारों को वैश्विक अभिव्यक्ति देना।\n२. डिजिटल माध्यम से रोजगार एवं आय अर्जित करना।\n३. पाठकों से सीधा संवाद स्थापित करना।',
        type: 'short',
        marks: 4
      }
    ],
    mcqs: [
      {
        id: 'hin-m1',
        chapter: 'व्यावहारिक हिंदी',
        question: 'वेबलॉग (Weblog) का संक्षिप्त रूप क्या है?',
        options: ['वेबसाइट', 'ब्लॉग', 'ई-मेल', 'चॅट'],
        correctAnswerIndex: 1,
        explanation: 'Weblog को ही संक्षिप्त में Blog (ब्लॉग) कहा जाता है।'
      }
    ],
    samplePapers: [
      {
        id: 'hin-sp1',
        title: 'महाराष्ट्र कक्षा १२वीं हिंदी बोर्ड मॉडल पेपर २०२६',
        year: '2026 Model',
        totalMarks: 80,
        duration: '3 Hours 15 Minutes',
        sections: [
          { sectionName: 'विभाग १: गद्य', questionsCount: 20, instructions: '२० अंक' },
          { sectionName: 'विभाग २: पद्य', questionsCount: 20, instructions: '२० अंक' },
          { sectionName: 'विभाग ३: विशेष अध्ययन (कनुप्रिया)', questionsCount: 10, instructions: '१० अंक' },
          { sectionName: 'विभाग ४: व्यावहारिक हिंदी व अपठित', questionsCount: 20, instructions: '२० अंक' },
          { sectionName: 'विभाग ५: व्याकरण', questionsCount: 10, instructions: '१० अंक' }
        ],
        solutions: 'महाराष्ट्र बोर्ड उत्तरकुंजी अनुसार उत्तर।'
      }
    ],
    previousYearPapers: [
      {
        id: 'hin-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board Hindi Exam Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'मार्च २०२४ हिंदी बोर्ड परीक्षा प्रश्नपत्र एवं संपूर्ण हल।'
      }
    ]
  },
  {
    id: 'it',
    name: 'Information Technology (IT)',
    code: 'IT-97',
    iconName: 'Laptop',
    color: 'from-violet-600 to-purple-700',
    description: 'Maharashtra HSC Board Syllabus: Advanced Web Designing (HTML5/CSS3), Digital Marketing, Computerised Accounting (GST), E-Commerce & Postgre SQL Database.',
    chaptersCount: 6,
    notes: [
      {
        id: 'it-n1',
        title: 'Advanced Web Designing (HTML5, CSS3 & JavaScript)',
        chapter: 'Chapter 1: Advanced Web Designing',
        summary: 'HTML5 semantic tags (<header>, <nav>, <section>, <article>, <footer>), form validation inputs (email, tel, number, date), CSS3 flexbox/grid, and JS form validation.',
        keyPoints: [
          'HTML5 Semantic Elements improve SEO and accessibility.',
          'CSS3 Audio & Video tags with controls attribute.',
          'Form Input Attributes: required, pattern, placeholder, autocomplete, min, max.',
          'Client-side Validation using JavaScript functions.'
        ]
      },
      {
        id: 'it-n2',
        title: 'Computerised Accounting System & GST Integration',
        chapter: 'Chapter 3: Computerised Accounting',
        summary: 'Accounting software fundamentals, Ledger creation, Voucher types (Payment F5, Receipt F6, Contra F4, Journal F7, Sales F8, Purchase F9), and GST taxation calculation.',
        keyPoints: [
          'GST Components: CGST (Central), SGST (State), IGST (Integrated for inter-state sales).',
          'Voucher Entry Shortcuts in Accounting Software.'
        ]
      }
    ],
    questionBank: [
      {
        id: 'it-q1',
        chapter: 'Advanced Web Designing',
        question: 'Explain any 4 HTML5 semantic elements with code examples.',
        answer: '1. <header>: Defines introductory content or navigation links.\n2. <nav>: Defines set of navigation links.\n3. <section>: Defines a thematic grouping of content.\n4. <footer>: Defines footer section containing copyright/contact info.\n\nExample:\n<header><h1>Welcome to HSC IT</h1></header>\n<nav><a href="#home">Home</a></nav>',
        type: 'short',
        marks: 4
      }
    ],
    mcqs: [
      {
        id: 'it-m1',
        chapter: 'Advanced Web Designing',
        question: 'Which attribute in HTML5 form is used to make an input field mandatory?',
        options: ['autofocus', 'required', 'pattern', 'placeholder'],
        correctAnswerIndex: 1,
        explanation: 'The "required" attribute specifies that an input field must be filled out before submitting.'
      }
    ],
    samplePapers: [
      {
        id: 'it-sp1',
        title: 'Maharashtra HSC Board IT Online Exam Model Paper 2026',
        year: '2026 Model',
        totalMarks: 80,
        duration: '2 Hours 30 Minutes',
        sections: [
          { sectionName: 'MCQ Single Answer', questionsCount: 10, instructions: '10 Marks.' },
          { sectionName: 'MCQ Two Correct Answers', questionsCount: 10, instructions: '20 Marks.' },
          { sectionName: 'MCQ Three Correct Answers', questionsCount: 2, instructions: '6 Marks.' },
          { sectionName: 'True / False', questionsCount: 10, instructions: '10 Marks.' },
          { sectionName: 'Match the Following', questionsCount: 4, instructions: '4 Marks.' },
          { sectionName: 'Short Answers & HTML Coding', questionsCount: 5, instructions: '30 Marks.' }
        ],
        solutions: 'Full HTML/CSS code solutions and SQL query answers.'
      }
    ],
    previousYearPapers: [
      {
        id: 'it-pyp1',
        year: 'March 2024',
        board: 'Maharashtra HSC Board',
        title: 'HSC Board IT Online Exam Paper March 2024',
        totalMarks: 80,
        solutionsSummary: 'Complete March 2024 HSC Board IT paper answer key.'
      }
    ]
  }
];

export interface CommerceTimetableSlot {
  id: string;
  day: string;
  timeSlot: string;
  subjectName: string;
  topic: string;
  type: string;
  duration: string;
}

export const DEFAULT_COMMERCE_TIMETABLE: CommerceTimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', timeSlot: '06:00 - 08:00 AM', subjectName: 'Book Keeping & Accountancy', topic: 'Partnership Final Accounts Practice & Adjustments', type: 'Numericals', duration: '2 Hours' },
  { id: 'tt-2', day: 'Monday', timeSlot: '05:00 - 07:00 PM', subjectName: 'OCM', topic: 'Henri Fayol 14 Principles & POSDCORB Functions', type: 'Theory', duration: '2 Hours' },
  { id: 'tt-3', day: 'Tuesday', timeSlot: '06:00 - 08:00 AM', subjectName: 'Economics', topic: 'Law of Diminishing Marginal Utility & Demand Analysis', type: 'Theory & Graph', duration: '2 Hours' },
  { id: 'tt-4', day: 'Tuesday', timeSlot: '05:00 - 07:00 PM', subjectName: 'Secretarial Practice (SP)', topic: 'Secretarial Letters (Allotment, Dividend Warrant)', type: 'Drafting', duration: '2 Hours' },
  { id: 'tt-5', day: 'Wednesday', timeSlot: '06:00 - 08:00 AM', subjectName: 'Book Keeping & Accountancy', topic: 'NPO Receipts & Payments to Income & Expenditure A/c', type: 'Practical', duration: '2 Hours' },
  { id: 'tt-6', day: 'Wednesday', timeSlot: '05:00 - 07:00 PM', subjectName: 'Mathematics & Stats / IT', topic: 'Logic Truth Tables / HTML5 CSS3 Web Designing', type: 'Practice', duration: '2 Hours' },
  { id: 'tt-7', day: 'Thursday', timeSlot: '06:00 - 08:00 AM', subjectName: 'Economics', topic: 'National Income 3 Methods & Multiplier Numericals', type: 'Numericals', duration: '2 Hours' },
  { id: 'tt-8', day: 'Thursday', timeSlot: '05:00 - 07:00 PM', subjectName: 'English', topic: 'An Astrologer\'s Day Summary & Mind Mapping Format', type: 'Writing Skills', duration: '2 Hours' },
  { id: 'tt-9', day: 'Friday', timeSlot: '06:00 - 08:00 AM', subjectName: 'Book Keeping & Accountancy', topic: 'Bill of Exchange Journal Entries & Noting Charges', type: 'Journal Entries', duration: '2 Hours' },
  { id: 'tt-10', day: 'Friday', timeSlot: '05:00 - 07:00 PM', subjectName: 'Marathi / Hindi', topic: 'उपयोजित मराठी (मुलाखत) / व्यावहारिक हिंदी (ब्लॉग)', type: 'Language', duration: '2 Hours' },
  { id: 'tt-11', day: 'Saturday', timeSlot: '06:00 - 09:00 AM', subjectName: 'All Commerce Subjects', topic: 'Weekly Revision & Solve 20 HSC Board MCQs', type: 'Revision', duration: '3 Hours' },
  { id: 'tt-12', day: 'Sunday', timeSlot: '02:00 - 05:00 PM', subjectName: 'Board Mock Test', topic: 'Full 80 Marks HSC Board Sample Paper Test', type: 'Mock Exam', duration: '3 Hours' }
];
