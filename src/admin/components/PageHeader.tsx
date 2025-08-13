import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gold-500">{title}</h1>
        {description && <p className="text-gray-400 mt-1">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;
