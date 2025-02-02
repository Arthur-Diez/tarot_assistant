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
    const urlParams = new URLSearchParams(window.location.search);
    const deckName = urlParams.get("deck_name");
    const topic = urlParams.get("topic");
    const spreadName = urlParams.get("spread_name");
    const cards = urlParams.get("cards")?.split(",") || [];
  
    if (!deckName || !topic || !spreadName || cards.length === 0) {
      console.error("[ERROR] Отсутствуют обязательные параметры в URL");
    } else {
      console.log("URL Parameters:", { deckName, topic, spreadName, cards });
  
      dispatch({
        type: "INITIALIZE_GAME",
        payload: { deck: cards, cardsToReveal: cards.length },
      });
    }
  }, []);

  const handleCardClick = (index) => {
    if (!state.gameOver) {
      dispatch({ type: "REVEAL_CARD", index });
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  
    // Отправка данных в Telegram бота
    if (window.Telegram?.WebApp?.sendData) {
      try {
        window.Telegram.WebApp.sendData(
          JSON.stringify({ revealedCards: state.revealedCards })
        );
        console.log("[DEBUG] Данные успешно отправлены:", state.revealedCards);
      } catch (error) {
        console.error("[ERROR] Ошибка отправки данных в бота:", error);
      }
    } else {
      console.error("[ERROR] Telegram WebApp API недоступен");
    }
  };

  const handleReturnToBot = () => {
    console.log("[DEBUG] Приложение закрыто");
  
    if (window.Telegram?.WebApp?.sendData) {
      // Отправляем только сигнал о закрытии
      window.Telegram.WebApp.sendData(
        JSON.stringify({ action: "close" })
      );
    }
  
    if (window.Telegram?.WebApp?.close) {
      window.Telegram.WebApp.close();
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
          Посмотреть результат расклада
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
          Посмотреть карты
        </button>
      )}
    </div>
  );
};

export default App;














