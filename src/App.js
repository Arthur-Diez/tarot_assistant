import React, { useReducer, useState, useEffect } from "react";
import "./App.css";

const initialState = {
  deck: [],
  revealedCards: [],
  gameOver: false,
  cardsToReveal: 0,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_GAME":
      return {
        ...state,
        deck: action.payload.deck.map((card) => ({ name: card, revealed: false })),
        cardsToReveal: action.payload.cardsToReveal,
      };
    case "REVEAL_CARD":
      if (!state.deck[action.index].revealed && state.revealedCards.length < state.cardsToReveal) {
        const updatedDeck = state.deck.map((card, i) =>
          i === action.index ? { ...card, revealed: true } : card
        );
        const newRevealedCards = [...state.revealedCards, updatedDeck[action.index].name];
        const isGameOver = newRevealedCards.length === state.cardsToReveal;

        return {
          ...state,
          deck: updatedDeck,
          revealedCards: newRevealedCards,
          gameOver: isGameOver,
        };
      }
      return state;
    case "RESET_GAME":
      return initialState;
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Telegram WebApp API Initialization
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      console.log("Init Data:", window.Telegram.WebApp.initDataUnsafe);
    }

    // Extract parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const deckName = urlParams.get("deck_name");
    const topic = urlParams.get("topic");
    const spreadName = urlParams.get("spread_name");
    const cards = urlParams.get("cards")?.split(",") || [];

    console.log("URL Parameters:", { deckName, topic, spreadName, cards });

    if (deckName && topic && spreadName && cards.length > 0) {
      dispatch({
        type: "INITIALIZE_GAME",
        payload: { deck: cards, cardsToReveal: cards.length },
      });
    } else {
      console.error("Некорректные параметры URL.");
    }
  }, []);

  const handleCardClick = (index) => {
    if (!state.gameOver) {
      dispatch({ type: "REVEAL_CARD", index });
    }
  };

  const handleShowResults = () => {
    setShowResults(true);

    // Отправка данных в Telegram бота (но не закрываем приложение)
    if (window.Telegram?.WebApp?.sendData) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({ revealedCards: state.revealedCards })
      );
    }
  };

  const handleReturnToBot = () => {
    if (window.Telegram?.WebApp?.close) {
      window.Telegram.WebApp.close();
    } else {
      console.log("Возвращение в бота.");
    }
  };

  if (showResults) {
    return (
      <div className="App">
        <h1>Результаты Расклада</h1>
        <div className="results">
          {state.revealedCards.map((card, index) => (
            <div key={index} className="result-card">
              <img src={`/cards/${card}.png`} alt={card} className="result-card-image" />
              <p>{card}</p>
            </div>
          ))}
        </div>
        <button onClick={handleReturnToBot} className="results-button">
          Вернуться в бота
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Расклад Таро</h1>
      <div className="deck">
        {state.deck.slice(0, state.cardsToReveal).map((card, index) => (
          <div
            key={index}
            className={`card ${card.revealed ? "revealed" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <img src={`/cards/${card.name}.png`} alt={card.name} className="card-image" />
              </div>
              <div className="card-back">
                <img src="/cards/back.png" alt="Закрытая карта" className="card-image" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {state.gameOver && !showResults && (
        <button onClick={handleShowResults} className="results-button">
          Посмотреть результаты
        </button>
      )}
    </div>
  );
};

export default App;














