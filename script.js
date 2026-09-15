const funFacts = [
  "Honey never spoils — archaeologists have found edible honey in ancient Egyptian tombs.",
  "Octopuses have three hearts and blue blood.",
  "A group of flamingos is called a 'flamboyance'.",
  "Bananas are botanically classified as berries, but strawberries aren't.",
  "The Eiffel Tower can grow taller in summer due to metal expanding in heat.",
  "Sea otters hold hands while sleeping so they don't drift apart.",
  "A day on Venus is longer than a year on Venus.",
  "Wombat poop is cube-shaped.",
  "The shortest war in history lasted about 38 minutes.",
  "There are more possible chess games than atoms in the observable universe.",
];

const factButton = document.querySelector("#fact-button");
const factDisplay = document.querySelector("#fact-display");

factButton.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * funFacts.length);
  factDisplay.textContent = funFacts[randomIndex];
});
