import React from 'react';

// Re-mapped from user spec for better semantic meaning
export const HomeIcon: React.FC<{className?: string}> = (props) => (
  // FIX: Corrected the viewBox attribute from '0 0 24" 24"' to '0 0 24 24'.
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" vectorEffect="non-scaling-stroke"/>
    <polyline points="9 22 9 12 15 12 15 22" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const ClipboardListIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" vectorEffect="non-scaling-stroke"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" vectorEffect="non-scaling-stroke"/>
    <path d="M12 11h4" vectorEffect="non-scaling-stroke"/><path d="M12 16h4" vectorEffect="non-scaling-stroke"/><path d="M8 11h.01" vectorEffect="non-scaling-stroke"/><path d="M8 16h.01" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const UsersIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" vectorEffect="non-scaling-stroke"/>
    <circle cx="9" cy="7" r="4" vectorEffect="non-scaling-stroke"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" vectorEffect="non-scaling-stroke"/><path d="M16 3.13a4 4 0 0 1 0 7.75" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const UserCogIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" vectorEffect="non-scaling-stroke"/><circle cx="9" cy="7" r="4" vectorEffect="non-scaling-stroke"/>
    <circle cx="19" cy="11" r="2" vectorEffect="non-scaling-stroke"/><path d="M19 8v1" vectorEffect="non-scaling-stroke"/><path d="M19 13v1" vectorEffect="non-scaling-stroke"/><path d="m21.6 9.5-.87.5" vectorEffect="non-scaling-stroke"/><path d="m17.27 12-.87.5" vectorEffect="non-scaling-stroke"/><path d="m21.6 12.5-.87-.5" vectorEffect="non-scaling-stroke"/><path d="m17.27 10-.87-.5" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const CarIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1h2" vectorEffect="non-scaling-stroke"/>
    <circle cx="7" cy="17" r="2" vectorEffect="non-scaling-stroke"/><circle cx="17" cy="17" r="2" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const WrenchIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const ShieldIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" vectorEffect="non-scaling-stroke"/>
    </svg>
);

export const SearchIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" vectorEffect="non-scaling-stroke"/><path d="m21 21-4.3-4.3" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const MenuIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" vectorEffect="non-scaling-stroke"/><line x1="4" x2="20" y1="6" y2="6" vectorEffect="non-scaling-stroke"/><line x1="4" x2="20" y1="18" y2="18" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const XIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" vectorEffect="non-scaling-stroke"/><path d="m6 6 12 12" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const PlusIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" vectorEffect="non-scaling-stroke"/><path d="M12 5v14" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const PencilIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" vectorEffect="non-scaling-stroke"/>
    <path d="m15 5 4 4" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const TrashIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" vectorEffect="non-scaling-stroke"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" vectorEffect="non-scaling-stroke"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" vectorEffect="non-scaling-stroke"/><line x1="10" x2="10" y1="11" y2="17" vectorEffect="non-scaling-stroke"/>
    <line x1="14" x2="14" y1="11" y2="17" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const ChevronUpIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const ChevronDownIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const SelectorIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 9 4-4 4 4" vectorEffect="non-scaling-stroke"/><path d="m16 15-4 4-4-4" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const ChevronLeftIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const ChevronRightIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const EyeIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" vectorEffect="non-scaling-stroke"/><circle cx="12" cy="12" r="3" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const PaperPlaneIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" vectorEffect="non-scaling-stroke"/>
    <path d="M22 2 11 13" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const MapPinIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" vectorEffect="non-scaling-stroke"/>
    <circle cx="12" cy="10" r="3" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const ExternalLinkIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" vectorEffect="non-scaling-stroke"/>
    <polyline points="15 3 21 3 21 9" vectorEffect="non-scaling-stroke"/>
    <line x1="10" y1="14" x2="21" y2="3" vectorEffect="non-scaling-stroke"/>
  </svg>
);

// Status Icons
export const CheckIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const ActivityIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const CircleIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const ClockIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke"/><polyline points="12 6 12 12 16 14" vectorEffect="non-scaling-stroke"/>
  </svg>
);
export const CheckCircleIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" vectorEffect="non-scaling-stroke"/><path d="m9 12 2 2 4-4" vectorEffect="non-scaling-stroke"/>
  </svg>
);

// Toast Icons
export const SuccessIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" vectorEffect="non-scaling-stroke"/><path d="m9 12 2 2 4-4" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const ErrorIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="8" x2="12" y2="12" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="16" x2="12.01" y2="16" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const InfoIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="16" x2="12" y2="12" vectorEffect="non-scaling-stroke" />
        <line x1="12" y1="8" x2="12.01" y2="8" vectorEffect="non-scaling-stroke" />
    </svg>
);

export const DownloadIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" vectorEffect="non-scaling-stroke"/>
    <polyline points="7 10 12 15 17 10" vectorEffect="non-scaling-stroke"/>
    <line x1="12" y1="15" x2="12" y2="3" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const UploadIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" vectorEffect="non-scaling-stroke"/>
        <polyline points="17 8 12 3 7 8" vectorEffect="non-scaling-stroke"/>
        <line x1="12" y1="3" x2="12" y2="15" vectorEffect="non-scaling-stroke"/>
    </svg>
);

export const PrinterIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" vectorEffect="non-scaling-stroke"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" vectorEffect="non-scaling-stroke"/>
    <rect x="6" y="14" width="12" height="8" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const MoreHorizontalIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" vectorEffect="non-scaling-stroke"/><circle cx="19" cy="12" r="1" vectorEffect="non-scaling-stroke"/><circle cx="5" cy="12" r="1" vectorEffect="non-scaling-stroke"/>
  </svg>
);

export const UserIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" vectorEffect="non-scaling-stroke" />
    <circle cx="12" cy="7" r="4" vectorEffect="non-scaling-stroke" />
  </svg>
);

export const LogOutIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" vectorEffect="non-scaling-stroke" />
    <polyline points="16 17 21 12 16 7" vectorEffect="non-scaling-stroke" />
    <line x1="21" y1="12" x2="9" y2="12" vectorEffect="non-scaling-stroke" />
  </svg>
);

export const ArrowUturnLeftIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const ExclamationTriangleIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);