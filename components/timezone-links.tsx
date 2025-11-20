export default function TimezoneLinks() {
  const timezones = ["UTC", "GMT", "EST", "CST", "MST", "PST", "CET", "IST", "JST", "AEST"]

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 md:py-20 border-t border-border">
      <h2 className="text-lg font-semibold mb-6 text-foreground">Quick Links</h2>
      <div className="flex flex-wrap gap-4">
        {timezones.map((tz) => (
          <button key={tz} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            {tz}
          </button>
        ))}
      </div>
    </section>
  )
}
