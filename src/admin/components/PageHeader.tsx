import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gold-500">{title}</h1>
      {description && <p className="text-gray-400 mt-1">{description}</p>}
    </div>
  );
};

export default PageHeader;
