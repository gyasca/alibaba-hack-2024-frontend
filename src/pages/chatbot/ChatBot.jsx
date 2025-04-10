import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import useUser from "../../context/useUser";

const ChatBot = () => {
    const {user, jwtUser} = useUser()
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hello! How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [botTyping, setBotTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = useCallback(async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        setMessages((prev) => [...prev, { from: "user", text: trimmedInput }]);
        setInput("");
        setBotTyping(true);

        try {
            const memory = [
                ...messages.map((msg) => ({
                    role: msg.from === "bot" ? "assistant" : "user",
                    content: msg.text,
                })),
                { role: "user", content: trimmedInput + "(user id is " + jwtUser()+")"},
            ];

            console.log("Payload to API:", memory); // Debug the payload

            const response = await axios.post(
                `http://localhost:3001/gpt/chat_response`,
                { memory }
            );
            const botResponse = response.data.response || "Oops! Invalid response from server.";
            const apiUrl = response.data.api_url;
            const apiResult = response.data.api_result;

            setMessages((prev) => [
                ...prev,
                { from: "bot", text: botResponse }
                // { from: "bot", text: `API URL: ${apiUrl}` },
                // { from: "bot", text: `API Response: ${JSON.stringify(apiResult, null, 2)}` },
            ]);
        } catch (error) {
            console.error("Error during API call:", error.response?.data || error.message);
            setMessages((prev) => [
                ...prev,
                { from: "bot", text: "Oops! Something went wrong. Please try again." },
            ]);
        } finally {
            setBotTyping(false);
        }
    }, [input, messages]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && input.trim()) {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.from === "bot" ? "justify-start" : "justify-end"}`}>
                        <div
                            className={`rounded-xl px-4 py-3 max-w-xs ${
                                message.from === "bot"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-blue-500 text-white"
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {botTyping && (
                    <div className="flex justify-start">
                        <img
                            src="https://support.signal.org/hc/article_attachments/360016877511/typing-animation-3x.gif"
                            alt="Typing..."
                            className="w-16 h-16"
                        />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                <div className="flex">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-500"
                        aria-label="Type your message"
                    />
                    <button
                        onClick={handleSend}
                        className={`px-4 py-2 ${
                            input.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
                        } text-white rounded-r-md focus:outline-none`}
                        disabled={!input.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
