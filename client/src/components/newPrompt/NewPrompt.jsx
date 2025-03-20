import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaArrowAltCircleRight } from "react-icons/fa";

const NewPrompt = ({ data }) => {
  const [ques, setQues] = useState(null);
  const [ans, setAns] = useState(null);
  const endRef = useRef(null);
  const formRef = useRef(null);
  const submitRef = useRef(null);
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {}
  });
  // const [initialResponseProcessed, setInitialResponseProcessed] = useState(false);

  const chat = model.startChat({
    history: data?.history.map(({ role, parts }) => ({
      role,
      parts: [{ text: parts[0].text }],
    })),
    generationConfig: {
      // maxOutputTokens: 100,
    },
  });
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, ques, ans, img.dbData]);

  // Handle first-time chat creation
  // useEffect(() => {
  //   if (isNewChat && data?.history.length === 1 && !initialResponseProcessed) {
  //     const initialQuery = data.history[0].parts[0].text;
  //     processInitialMessage(initialQuery);
  //     setInitialResponseProcessed(true);
  //   }
  // }, [data, isNewChat, initialResponseProcessed]);
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        addans(data.history[0].parts[0].text, true);
      }
    }
    hasRun.current = true;
  }, []);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: ques?.length ? ques : undefined,
          answer: ans,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          formRef.current.reset();
          setQues("");
          setAns("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
        });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const addans = async (iptext, isInitial) => {
    if (!isInitial) setQues(iptext);
    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, iptext] : [iptext]
      );
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAns(accumulatedText);
      }

      mutation.mutate();
    } catch (err) {
      console.log(err);
      setAns("I'm afraid I can't answer that, please start a new chat!");
      formRef.current.reset();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const text = e.target.text.value;
    if (!text) return;

    addans(text);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitRef.current.click();
    }
  };
  return (
    <>
      {img.isLoading && <div>Loading...</div>}
      {img.dbData?.filePath && 
      (
        <IKImage
        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
        path={img.dbData?.filePath}
        width="380"
        transformation={[{width:380}]}
        />
      )
      }
      {ques && <div className="message user">{ques}</div>}
      {ans && (
        <div className="message">
          <Markdown>{ans}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg}/>
        <input id="file" type="file" accept="image/*" multiple={false} hidden/>
        <textarea onKeyDown={handleKeyDown} name="text" inputMode="text" rows="5" cols="33" placeholder="Ask anything..." className="bg-transparent w-full h-[45px] p-2 focus:outline-none" ></textarea>
        <button disabled={ans} ref={submitRef} className="w-8 h-8 text-6xl ">
        <FaArrowAltCircleRight  className={ans ? "text-gray-400" : "text-blue-400"} />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;