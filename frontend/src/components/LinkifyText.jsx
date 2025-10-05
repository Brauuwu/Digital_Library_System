import React from 'react';

// Simple linkify: split text by urls and return array of nodes with anchors
export default function LinkifyText({ text }) {
  if (!text) return null;
  // Regex to match http/https URLs
  const urlRE = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRE);
  return (
    <>
      {parts.map((p, i) =>
        urlRE.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
