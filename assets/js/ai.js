const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Your browser does not support Speech Recognition. Try using Chrome or Edge.");
} else {
  const recognition = new SpeechRecognition();
  let isListening = false;

  const startStopBtn = document.getElementById("startStopBtn");
  const transcriptPara = document.getElementById("transcript");

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    transcriptPara.textContent = `You said: "${transcript}"`;
    console.log("Transcript:", transcript);

    // Optional: send to OpenAI
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: transcript }]
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;
      console.log("OpenAI:", reply);
    } catch (err) {
      console.error("OpenAI API error:", err);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  startStopBtn.addEventListener("click", () => {
    if (!isListening) {
      recognition.start();
      startStopBtn.textContent = "🛑 Stop Listening";
      isListening = true;
    } else {
      recognition.stop();
      startStopBtn.textContent = "🎙️ Start Listening";
      isListening = false;
    }
  });
}
