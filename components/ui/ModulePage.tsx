import React from "react";

export function ModulePage({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="welcome-copy">{subtitle}</p>
        </div>
        <div className="heading-sticker">
          CAMPUS<br />COMMONS <span>✦</span>
        </div>
      </div>
      {children}
    </>
  );
}
