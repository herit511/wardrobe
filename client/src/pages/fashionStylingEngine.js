export function applyStyleIntelligence(rawOutfits, selectedOccasion, selectedWeather) {
  if (!Array.isArray(rawOutfits)) return []

  return rawOutfits.map((outfit) => {
    if (outfit?.card) return outfit

    const fallbackVibe = outfit?.outfitName || 'Styled Outfit'
    const fallbackOneLine = outfit?.description || `Styled for ${selectedOccasion}`
    const fallbackFeelLine = outfit?.feelLine || `Balanced for ${selectedWeather} weather.`
    const fallbackMove = outfit?.signatureMove || 'Keep proportions clean and intentional.'

    const normalizedHowToWear = Array.isArray(outfit?.microStyling)
      ? outfit.microStyling
          .map((row) => ({
            item: row?.item || 'item',
            tip: row?.tip || ''
          }))
          .filter((row) => row.tip)
          .slice(0, 3)
      : []

    return {
      ...outfit,
      card: {
        vibe: fallbackVibe,
        oneLine: fallbackOneLine,
        feelLine: fallbackFeelLine,
        theMove: fallbackMove,
        howToWear: normalizedHowToWear,
        dont: outfit?.antiTip || 'Do not over-style this look.'
      }
    }
  })
}
