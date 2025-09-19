import { ItineraryModule, Persona } from "@shared/schema";

/**
 * Determines the season based on the start date of the trip.
 * This is a general approximation and may need adjustment for specific regions.
 * @param startDate - The start date of the trip.
 * @returns The season as a string ('winter', 'spring', 'summer', 'monsoon', 'autumn').
 */
const getSeason = (startDate: Date): string => {
  const month = startDate.getMonth(); // 0-11 (Jan-Dec)
  if (month >= 2 && month < 5) return "spring"; // Mar, Apr, May
  if (month >= 5 && month < 7) return "summer"; // Jun, Jul
  if (month >= 7 && month < 9) return "monsoon"; // Aug, Sep (broadly for South Asia)
  if (month >= 9 && month < 11) return "autumn"; // Oct, Nov
  return "winter"; // Dec, Jan, Feb
};

/**
 * Selects a sequence of itinerary modules based on user persona, trip duration, and season.
 *
 * @param persona - The user's travel persona document.
 * @param allModules - A list of all available itinerary module documents.
 * @param durationInDays - The total duration of the trip in days.
 * @param startDate - The start date of the trip.
 * @returns An array of module IDs representing the sequenced itinerary.
 */
export function selectItineraryModules(
  persona: Persona,
  allModules: ItineraryModule[],
  durationInDays: number,
  startDate: Date
): string[] {
  if (durationInDays <= 0) {
    return [];
  }

  const { available_modules: personaModuleIds } = persona;
  const season = getSeason(startDate);

  // Rule 1: Fixed Bookends
  const arrivalModule = "module-arrival-and-acclimatize";
  const departureModule = "module-departure-and-reflection";

  if (durationInDays === 1) {
    return [arrivalModule];
  }
  if (durationInDays === 2) {
    return [arrivalModule, departureModule];
  }

  // Rule 2: Create a Filtered Pool of Modules
  const personaModules = allModules.filter((module) =>
    personaModuleIds.includes(module.id)
  );

  const coreModules = personaModules.filter((module) => {
    const isBookend =
      module.id === arrivalModule || module.id === departureModule;
    if (isBookend) return false;

    // Seasonal Filter
    const isApplicableSeason =
      module.applicable_seasons.includes("all") ||
      module.applicable_seasons.includes(season);

    return isApplicableSeason;
  });

  if (coreModules.length === 0) {
    // Fallback if no core modules are available for the season
    const fallbackModule = personaModuleIds.find(
      (id) => id !== arrivalModule && id !== departureModule
    );
    const itineraryModules = [arrivalModule];
    for (let i = 0; i < durationInDays - 2; i++) {
      itineraryModules.push(fallbackModule || personaModuleIds[0]);
    }
    itineraryModules.push(departureModule);
    return itineraryModules;
  }

  // Rule 3: Dynamic Selection & Sequence Building
  const itineraryModules: string[] = [arrivalModule];
  const daysToFill = durationInDays - 2;
  let lastUsedModuleIndex = -1;

  for (let i = 0; i < daysToFill; i++) {
    let nextModuleIndex = Math.floor(Math.random() * coreModules.length);

    // Repetition Guard: Simple version to avoid consecutive duplicates
    if (coreModules.length > 1 && nextModuleIndex === lastUsedModuleIndex) {
      nextModuleIndex = (nextModuleIndex + 1) % coreModules.length;
    }

    // A more advanced logic could be implemented here for narrative flow,
    // for now, we'll use the random selection with repetition guard.

    const selectedModule = coreModules[nextModuleIndex];
    itineraryModules.push(selectedModule.id);
    lastUsedModuleIndex = nextModuleIndex;
  }

  itineraryModules.push(departureModule);

  return itineraryModules;
}

/**
 * Example Usage (can be removed or used for testing)
 *
 * import { personas, itineraryModules } from './seed'; // Assuming seed data is accessible
 *
 * const thrillSeeker = personas.find(p => p.id === 'thrill-seeker');
 * if (thrillSeeker) {
 *   const duration = 7;
 *   const tripStartDate = new Date('2024-01-15'); // A winter date
 *   const selectedModules = selectItineraryModules(thrillSeeker, itineraryModules, duration, tripStartDate);
 *   console.log(`Selected modules for a ${duration}-day Thrill-Seeker trip in winter:`);
 *   console.log(selectedModules);
 *   // Expected output might be:
 *   // [ 'module-arrival-and-acclimatize', 'module-winter-zenith', 'module-mountain-conqueror', 'module-local-connection', 'module-summit-conqueror', 'module-urban-daredevil', 'module-departure-and-reflection' ]
 * }
 */
