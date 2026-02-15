import type { TFunction } from 'i18next'

/**
 * Convert API period_label (e.g. "Semaine 4", "Mois 6", "Années 5") to i18n key (schedule.Semaine_4, etc.)
 */
export function periodLabelToKey(periodLabel: string): string {
  return periodLabel
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents: Années -> Annees
}

/**
 * Return translated schedule period label for the current language.
 * Falls back to the raw period_label if no translation exists.
 */
export function getSchedulePeriodLabel(periodLabel: string, t: TFunction): string {
  const key = periodLabelToKey(periodLabel)
  const translated = t(`schedule.${key}`)
  return translated !== `schedule.${key}` ? translated : periodLabel
}
