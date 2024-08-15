(async () => {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAi = new GoogleGenerativeAI("AIzaSyDsRFvJFpnVDq1XTSEgj_BfkdWflUoXzOA");

    const model = genAi.getGenerativeModel({
        model: "gemini-1.5-pro"
    });

    const r = await model.generateContent("How to become Data Analyst");

    console.log(r.response.text());
})();
