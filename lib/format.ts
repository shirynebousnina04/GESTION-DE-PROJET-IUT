export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
