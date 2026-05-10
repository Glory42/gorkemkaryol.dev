interface Props {
  html: string;
  hadError: boolean;
}

export function ReadmeArticle({ html, hadError }: Props) {
  return (
    <div>
      {hadError && (
        <div className="mb-6 border border-[rgba(246,193,119,0.3)] bg-[rgba(246,193,119,0.06)] px-4 py-3">
          <p className="mono text-[11px] text-[rgba(246,193,119,0.85)]">
            Markdown rendering encountered an issue — showing plain text fallback.
          </p>
        </div>
      )}

      <div
        className="readme-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
