import { GoogleGenAI } from "@google/genai";

// creates a gemini client client with your API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, //reads secret api key from server env
});

/*
//test if api works
export async function GET() {
  return Response.json({
    message: "API is working!",
  });
}
*/

// POST request handler for the /api/goals route

// This handler submits a prompt, generates a response
//  from the Gemini model and returns it as JSON.
export async function POST(request) {
  try {

    const { goal } = await request.json(); //reads the goal from the request body

    //check if the goal is valid 
    if (
      typeof goal !== "string" || //goal must be a string
      !goal.trim() || //checks if goal is empty
      goal.length > 300 //checks if goal is less than 300 characters
    ) {
      return Response.json(
        { error: "Please provide a valid goal." },
        { status: 400 }
      );
    }

    // Generate content using the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite", //specifies the model to use
      contents: 'This is my goal: ' +  goal +'. Create a list of 3 specific tasks to accomplish my goal.'
      +'Your output must be exactly 3 sentences, each task on a new line, and must be under 100 characters.'
      + 'Use SMART framework (Specific, Measurable, Achievable, Relevant, and Time-bound) for building tasks. '
      , 
      //prompt
    });//prompt asks to format our output to be put in an array

    console.log("RAW GEMINI RESPONSE:", response.text);//logs the raw response from Gemini to the console for debugging

      //split the response into an array of tasks
      const tasks = (response.text ?? "")
      .split("\n")
      .map(line => line.trim())//trim whitespace from each line, and store in an array
      .filter(Boolean) //filter out empty lines
      .slice(0, 3); //take the first 3 elementstasks

    if (tasks.length !== 3) {
      throw new Error("Expected three tasks");
    }//check if the response contains 3 tasks
    
    // Wait for response, return the generated list of tasks
    return Response.json({tasks});
  
  } catch (error) {
     // Return an error msg if the request fails
    console.error("Gemini error:", error);
    return Response.json(
      { error: "Gemini request failed" },
      { status: 503 }
    );
  }
}

