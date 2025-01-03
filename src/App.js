import React, { useReducer, useState, useEffect } from "react";
import "./App.css";

const initialState = {
  deck: [], // Колода, которая придет от бота
  revealedCards: [],
  gameOver: false,
  cardsToReveal: 0, // Количество карт для расклада
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_GAME":
      return {
        ...state,
        deck: action.payload.deck.map(card => ({ name: card, revealed: false })),
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

  // Получение данных от Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const initData = window.Telegram.WebApp.initDataUnsafe; // Получаем данные
      const deck = initData?.deck || []; // Дефолтная пустая колода
      const cardsToReveal = initData?.cardsToReveal || 3; // Дефолтное количество карт

      // Инициализация игры с данными от Telegram
      dispatch({
        type: "INITIALIZE_GAME",
        payload: { deck, cardsToReveal },
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
    if (window.Telegram?.WebApp?.sendData) {
      // Отправка данных назад в бота
      window.Telegram.WebApp.sendData(JSON.stringify({ revealedCards: state.revealedCards }));
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
              <img
                src={`/cards/${card}.png`}
                alt={card}
                className="result-card-image"
              />
              <p>{card}</p>
            </div>
          ))}
        </div>
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
                <img
                  src={`/cards/${card.name}.png`}
                  alt={card.name}
                  className="card-image"
                />
              </div>
              <div className="card-back">
                <img
                  src="/cards/back.png"
                  alt="Закрытая карта"
                  className="card-image"
                />
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

console.log('Init Data:', window.Telegram.WebApp.initDataUnsafe);
export default App;














