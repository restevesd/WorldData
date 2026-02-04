import { GoogleGenAI, Type } from "@google/genai";
import { WorldStat, GeneratedScript } from '../types';

// Initialize Gemini Client
// IMPORTANT: Access API key from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches current simulated or grounded stats to populate the dashboard preview.
 * Uses Google Search Grounding to get real numbers where possible.
 * Returns { data, isFallback } to indicate source.
 */
export const fetchCurrentWorldStats = async (): Promise<{ data: WorldStat[], isFallback: boolean }> => {
  try {
    // We add a timestamp to the prompt to encourage the model to perform a fresh search/generation
    // and avoid caching mechanisms for 'live' requests.
    const timestamp = new Date().toLocaleTimeString();
    
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: `Retrieve the current dynamic statistics for the specific list below, based on Worldometers.info data.
      
      You MUST provide a value for EVERY item in this list:

      1. POPULATION:
         - Current World Population
         - Births this year
         - Births today
         - Deaths this year
         - Deaths today
         - Net population growth this year
         - Net population growth today

      2. GOVERNMENT & ECONOMICS:
         - Public Healthcare expenditure today
         - Public Education expenditure today
         - Public Military expenditure today
         - Cars produced this year
         - Bicycles produced this year
         - Computers produced this year

      3. SOCIETY & MEDIA:
         - New book titles published this year
         - Newspapers circulated today
         - TV sets sold worldwide today
         - Cellular phones sold today
         - Money spent on videogames today
         - Internet users in the world today
         - Emails sent today
         - Blog posts written today
         - Tweets sent today
         - Google searches today

      4. ENVIRONMENT:
         - Forest loss this year (hectares)
         - Land lost to soil erosion this year (ha)
         - CO2 emissions this year (tons)
         - Desertification this year (hectares)
         - Toxic chemicals released in the environment this year (tons)

      5. FOOD:
         - Undernourished people in the world
         - Overweight people in the world
         - Obese people in the world
         - People who died of hunger today
         - Money spent for obesity related diseases in the USA today
         - Money spent on weight loss programs in the USA today

      6. WATER:
         - Water used this year (million L)
         - Deaths caused by water related diseases this year
         - People with no access to a safe drinking water source

      7. ENERGY:
         - Energy used today (MWh)
         - Energy used today from non-renewable sources (MWh)
         - Energy used today from renewable sources (MWh)
         - Solar energy striking Earth today (MWh)
         - Oil pumped today (barrels)
         - Oil left (barrels)
         - Days to the end of oil
         - Natural Gas left (boe)
         - Days to the end of natural gas
         - Coal left (boe)
         - Days to the end of coal

      8. HEALTH:
         - Communicable disease deaths this year
         - Seasonal flu deaths this year
         - Deaths of children under 5 this year
         - Abortions this year
         - Deaths of mothers during birth this year
         - HIV/AIDS infected people
         - Deaths caused by HIV/AIDS this year
         - Deaths caused by cancer this year
         - Deaths caused by malaria this year
         - Cigarettes smoked today
         - Deaths caused by smoking this year
         - Deaths caused by alcohol this year
         - Suicides this year
         - Money spent on illegal drugs this year
         - Road traffic accident fatalities this year

      Provide numerical values for all. Current time reference: ${timestamp}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: [
                  'population', 
                  'government_economics', 
                  'society_media', 
                  'environment', 
                  'food', 
                  'water', 
                  'energy', 
                  'health'
                ] 
              },
            },
            required: ['label', 'value', 'category'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return { data: [], isFallback: true };
    
    const parsedData = JSON.parse(text) as WorldStat[];
    return { data: parsedData, isFallback: false };

  } catch (error: any) {
    // Graceful handling of rate limits (429) to prevent console spam and user panic
    if (error.status === 429 || error.code === 429 || error.message?.includes('429') || error.toString().includes('quota')) {
      console.warn("Gemini API Quota Exceeded. Switching to fallback data to maintain UI stability.");
    } else {
      console.error("Error fetching stats:", error);
    }

    // Full 63-item fallback list ensures CSV structure is correct even on error
    const fallbackData: WorldStat[] = [
      // POPULATION
      { label: "Current World Population", value: "8,100,000,000+", category: "population" },
      { label: "Births this year", value: "30,000,000+", category: "population" },
      { label: "Births today", value: "250,000+", category: "population" },
      { label: "Deaths this year", value: "15,000,000+", category: "population" },
      { label: "Deaths today", value: "140,000+", category: "population" },
      { label: "Net population growth this year", value: "15,000,000+", category: "population" },
      { label: "Net population growth today", value: "110,000+", category: "population" },

      // GOVERNMENT & ECONOMICS
      { label: "Public Healthcare expenditure today", value: "$18,000,000,000+", category: "government_economics" },
      { label: "Public Education expenditure today", value: "$14,000,000,000+", category: "government_economics" },
      { label: "Public Military expenditure today", value: "$5,000,000,000+", category: "government_economics" },
      { label: "Cars produced this year", value: "16,000,000+", category: "government_economics" },
      { label: "Bicycles produced this year", value: "30,000,000+", category: "government_economics" },
      { label: "Computers produced this year", value: "50,000,000+", category: "government_economics" },

      // SOCIETY & MEDIA
      { label: "New book titles published this year", value: "600,000+", category: "society_media" },
      { label: "Newspapers circulated today", value: "90,000,000+", category: "society_media" },
      { label: "TV sets sold worldwide today", value: "150,000+", category: "society_media" },
      { label: "Cellular phones sold today", value: "1,500,000+", category: "society_media" },
      { label: "Money spent on videogames today", value: "$300,000,000+", category: "society_media" },
      { label: "Internet users in the world today", value: "5,300,000,000+", category: "society_media" },
      { label: "Emails sent today", value: "200,000,000,000+", category: "society_media" },
      { label: "Blog posts written today", value: "4,000,000+", category: "society_media" },
      { label: "Tweets sent today", value: "600,000,000+", category: "society_media" },
      { label: "Google searches today", value: "8,500,000,000+", category: "society_media" },

      // ENVIRONMENT
      { label: "Forest loss this year (hectares)", value: "1,500,000+", category: "environment" },
      { label: "Land lost to soil erosion this year (ha)", value: "2,000,000+", category: "environment" },
      { label: "CO2 emissions this year (tons)", value: "10,000,000,000+", category: "environment" },
      { label: "Desertification this year (hectares)", value: "3,000,000+", category: "environment" },
      { label: "Toxic chemicals released in the environment this year (tons)", value: "2,500,000+", category: "environment" },

      // FOOD
      { label: "Undernourished people in the world", value: "850,000,000+", category: "food" },
      { label: "Overweight people in the world", value: "1,700,000,000+", category: "food" },
      { label: "Obese people in the world", value: "800,000,000+", category: "food" },
      { label: "People who died of hunger today", value: "20,000+", category: "food" },
      { label: "Money spent for obesity related diseases in the USA today", value: "$400,000,000+", category: "food" },
      { label: "Money spent on weight loss programs in the USA today", value: "$100,000,000+", category: "food" },

      // WATER
      { label: "Water used this year (million L)", value: "1,000,000,000+", category: "water" },
      { label: "Deaths caused by water related diseases this year", value: "200,000+", category: "water" },
      { label: "People with no access to a safe drinking water source", value: "700,000,000+", category: "water" },

      // ENERGY
      { label: "Energy used today (MWh)", value: "350,000,000+", category: "energy" },
      { label: "Energy used today from non-renewable sources (MWh)", value: "280,000,000+", category: "energy" },
      { label: "Energy used today from renewable sources (MWh)", value: "70,000,000+", category: "energy" },
      { label: "Solar energy striking Earth today (MWh)", value: "400,000,000,000+", category: "energy" },
      { label: "Oil pumped today (barrels)", value: "80,000,000+", category: "energy" },
      { label: "Oil left (barrels)", value: "1,500,000,000,000", category: "energy" },
      { label: "Days to the end of oil", value: "~40 years", category: "energy" },
      { label: "Natural Gas left (boe)", value: "1,100,000,000,000", category: "energy" },
      { label: "Days to the end of natural gas", value: "~150 years", category: "energy" },
      { label: "Coal left (boe)", value: "4,000,000,000,000", category: "energy" },
      { label: "Days to the end of coal", value: "~400 years", category: "energy" },

      // HEALTH
      { label: "Communicable disease deaths this year", value: "4,000,000+", category: "health" },
      { label: "Seasonal flu deaths this year", value: "150,000+", category: "health" },
      { label: "Deaths of children under 5 this year", value: "2,000,000+", category: "health" },
      { label: "Abortions this year", value: "12,000,000+", category: "health" },
      { label: "Deaths of mothers during birth this year", value: "90,000+", category: "health" },
      { label: "HIV/AIDS infected people", value: "40,000,000+", category: "health" },
      { label: "Deaths caused by HIV/AIDS this year", value: "500,000+", category: "health" },
      { label: "Deaths caused by cancer this year", value: "2,500,000+", category: "health" },
      { label: "Deaths caused by malaria this year", value: "300,000+", category: "health" },
      { label: "Cigarettes smoked today", value: "10,000,000,000+", category: "health" },
      { label: "Deaths caused by smoking this year", value: "1,500,000+", category: "health" },
      { label: "Deaths caused by alcohol this year", value: "800,000+", category: "health" },
      { label: "Suicides this year", value: "300,000+", category: "health" },
      { label: "Money spent on illegal drugs this year", value: "$100,000,000,000+", category: "health" },
      { label: "Road traffic accident fatalities this year", value: "400,000+", category: "health" },
    ];

    return { data: fallbackData, isFallback: true };
  }
};

/**
 * Generates the Python solution requested by the user.
 */
export const generatePythonScraper = async (): Promise<GeneratedScript> => {
  try {
    const prompt = `
      Create a comprehensive Python application to scrape 'https://www.worldometers.info/'.
      
      Requirements:
      1. Target: Extract ALL 60+ dynamic counters shown on the homepage. 
      2. Specific Data Points: 
         - Population (Current, Births/Deaths year/today, Growth)
         - Economics (Public Healthcare/Edu/Military, Cars, Bicycles, Computers)
         - Society (Books, Papers, TV, Phones, Games, Internet, Email, Blogs, Tweets, Google)
         - Environment (Forest, Soil, CO2, Desertification, Toxins)
         - Food (Undernourished, Overweight, Obese, Hunger deaths, Obesity spending)
         - Water (Water used, Water deaths, No safe water)
         - Energy (Total, Renewable/Non-renewable, Solar, Oil/Gas/Coal reserves & days left)
         - Health (Disease deaths, Flu, Child/Maternal mortality, HIV, Cancer, Malaria, Smoking, Alcohol, Suicide, Drugs, Traffic)
      3. Challenge: Data is updated via JavaScript (odometer effect).
      4. Solution: Use 'Playwright' (async) or 'Selenium' to capture the final rendered numbers.
      5. Storage: Store data in a CSV file (e.g., 'world_data.csv'). Each run should append a new row with a timestamp and columns for every single metric.
      6. Scheduler: The script must include a configuration variable for frequency (default: 1 hour) and use a scheduler loop to run indefinitely.
      7. Code Quality: Clean, commented, robust error handling.
      
      Return a JSON object with:
      - 'code': The full Python source code.
      - 'explanation': A brief markdown explanation of how it works.
      - 'libraries': A list of pip libraries needed.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            explanation: { type: Type.STRING },
            libraries: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['code', 'explanation', 'libraries']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No code generated");
    return JSON.parse(text) as GeneratedScript;
  } catch (error) {
    console.error("Error generating code:", error);
    return {
      code: "# Error generating code. Please try again.",
      explanation: "An error occurred.",
      libraries: []
    };
  }
};