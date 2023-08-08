import { gamesPageTutorialFromHome } from "./gamesPageTutorialFromHome";
import { homePageTutorial } from "./homePageTutorial";

// Unified place to register tutorials
// Keys for tutorials added here must match the tutorial's ID field
// e.g. homePageTutorial.id is "homePageTutorial", so its key here must be "homePageTutorial"
// This allows type checking when referencing tutorials through the registry
export const tutorialsRegistry = {
  homePageTutorial,
  gamesPageTutorialFromHome,
};
