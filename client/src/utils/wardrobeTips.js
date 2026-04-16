export function buildWeeklyWardrobeTips({ stats, weatherData }) {
  const totalItems = stats?.totalItems || 0;
  const totalOutfits = stats?.totalOutfits || 0;
  const addedThisMonth = stats?.addedThisMonth || 0;
  const totalTimesWorn = stats?.totalTimesWorn || 0;
  const distribution = stats?.categoryDistribution || {};

  const dominantEntry = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];
  const dominantCategory = dominantEntry ? dominantEntry[0] : null;
  const dominantPercent = dominantEntry ? dominantEntry[1] : 0;

  const tips = [];

  if (totalItems < 20) {
    tips.push({
      title: 'Build A Balanced Core Closet',
      detail: `Your closet currently has ${totalItems} items. Target 24-30 versatile pieces to improve rotation quality and reduce outfit repetition. Prioritize neutral tops, one structured outerwear layer, and two all-season footwear options.`,
      priority: 'high',
    });
  } else {
    tips.push({
      title: 'Optimize Rotation Efficiency',
      detail: `With ${totalItems} items, your foundation is strong. Shift focus from quantity to curation: retire low-use pieces and reinforce high-performing categories with elevated textures and fit variations.`,
      priority: 'medium',
    });
  }

  if (dominantCategory && dominantPercent >= 45) {
    tips.push({
      title: 'Correct Category Imbalance',
      detail: `${dominantCategory.charAt(0).toUpperCase() + dominantCategory.slice(1)} represents ${dominantPercent}% of your closet. Rebalance by adding adjacent categories to improve outfit versatility and increase combination depth.`,
      priority: 'high',
    });
  } else {
    tips.push({
      title: 'Maintain Category Distribution',
      detail: 'Your category spread is fairly balanced. Continue adding selectively to categories that directly expand outfit combinations rather than duplicating similar silhouettes.',
      priority: 'low',
    });
  }

  if (totalOutfits === 0) {
    tips.push({
      title: 'Convert Inventory Into Looks',
      detail: 'You have closet items but no saved outfits yet. Save at least 5 reusable outfit templates to accelerate daily decision-making and improve consistency in personal style.',
      priority: 'high',
    });
  } else {
    tips.push({
      title: 'Increase Reuse Performance',
      detail: `You have ${totalOutfits} saved outfits and ${totalTimesWorn} logged wears. Identify your top-performing outfits and replicate their color structure and silhouette logic in new combinations.`,
      priority: 'medium',
    });
  }

  if (addedThisMonth === 0) {
    tips.push({
      title: 'Plan A Monthly Refresh',
      detail: 'No items were added this month. Introduce one strategic piece this week (layering item, structured bottom, or versatile footwear) to keep your wardrobe evolving without overbuying.',
      priority: 'medium',
    });
  } else {
    tips.push({
      title: 'Audit Recent Additions',
      detail: `You added ${addedThisMonth} item(s) this month. Validate each new piece against at least three existing combinations to ensure strong integration and long-term utility.`,
      priority: 'low',
    });
  }

  if (weatherData?.temp !== undefined && weatherData?.desc) {
    tips.push({
      title: 'Weather-Responsive Styling',
      detail: `Current local weather is ${weatherData.temp}C with ${weatherData.desc}. Plan breathable base layers with one optional outer layer so your outfits remain adaptable throughout the day.`,
      priority: 'low',
    });
  }

  return tips.slice(0, 4);
}
