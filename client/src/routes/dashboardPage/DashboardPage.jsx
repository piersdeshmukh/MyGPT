import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./dashboardPage.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const submitRef = useRef(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    onSuccess: (id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;

    mutation.mutate(text);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitRef.current.click();
    }
  };
  
  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <h1>MY GPT</h1>
        </div>
        <div className="options">
          <div className="option">
            <img src="/chat.png" alt="" />
            <span>Paraphrase my text</span>
          </div>
          <div className="option">
            <img src="/image.png" alt="" />
            <span>Analyze Images</span>
          </div>
          <div className="option">
            <img src="/code.png" alt="" />
            <span>Help me with my Code</span>
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit} >
          <textarea onKeyDown={handleKeyDown} name="text" inputMode="text" rows="1" cols="33" placeholder="Ask me anything..." className="bg-transparent w-full p-2 px-4 focus:outline-none"></textarea>
          <button ref={submitRef}>
            <img src="/arrow-e.png" alt="send" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
