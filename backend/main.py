from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import List, Optional

app = FastAPI(title="Snake Water Gun API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory game state
game_state = {
    "user_score": 0,
    "computer_score": 0,
    "current_round": 1,
    "max_rounds": 5,
    "history": [],
    "is_finished": False,
    "final_winner": None
}

CHOICES = {
    "snake": 1,
    "water": -1,
    "gun": 0
}

REVERSE_CHOICES = {
    1: "snake",
    -1: "water",
    0: "gun"
}

class PlayRequest(BaseModel):
    choice: str

class RoundHistoryItem(BaseModel):
    round: int
    userChoice: str
    computerChoice: str
    result: str  # "win", "lose", "draw"
    userScore: int
    computerScore: int

class GameStateResponse(BaseModel):
    userScore: int
    computerScore: int
    currentRound: int
    maxRounds: int
    history: List[RoundHistoryItem]
    isFinished: bool
    finalWinner: Optional[str]

class PlayResponse(BaseModel):
    userChoice: str
    computerChoice: str
    result: str  # "win", "lose", "draw"
    userScore: int
    computerScore: int
    currentRound: int
    isFinished: bool
    finalWinner: Optional[str]
    history: List[RoundHistoryItem]

def get_current_state_response():
    # Convert internal history format to RoundHistoryItem format
    history_items = []
    for item in game_state["history"]:
        history_items.append(RoundHistoryItem(
            round=item["round"],
            userChoice=item["userChoice"],
            computerChoice=item["computerChoice"],
            result=item["result"],
            userScore=item["userScore"],
            computerScore=item["computerScore"]
        ))
    return GameStateResponse(
        userScore=game_state["user_score"],
        computerScore=game_state["computer_score"],
        currentRound=game_state["current_round"],
        maxRounds=game_state["max_rounds"],
        history=history_items,
        isFinished=game_state["is_finished"],
        finalWinner=game_state["final_winner"]
    )

@app.post("/api/game/start", response_model=GameStateResponse)
def start_game():
    global game_state
    game_state = {
        "user_score": 0,
        "computer_score": 0,
        "current_round": 1,
        "max_rounds": 5,
        "history": [],
        "is_finished": False,
        "final_winner": None
    }
    return get_current_state_response()

@app.get("/api/game/state", response_model=GameStateResponse)
def get_game_state():
    return get_current_state_response()

@app.post("/api/game/play", response_model=PlayResponse)
def play_round(request: PlayRequest):
    global game_state
    
    if game_state["is_finished"]:
        raise HTTPException(status_code=400, detail="Game is already finished. Start a new game.")
    
    user_choice = request.choice.lower()
    if user_choice not in CHOICES:
        raise HTTPException(status_code=400, detail="Invalid choice. Must be snake, water, or gun.")
    
    # Generate computer choice randomly: "snake", "water", or "gun"
    computer_choice = random.choice(["snake", "water", "gun"])
    
    # Evaluate game rules:
    # Snake beats Water, Water beats Gun, Gun beats Snake
    if user_choice == computer_choice:
        result = "draw"
    elif (user_choice == "snake" and computer_choice == "water") or \
         (user_choice == "water" and computer_choice == "gun") or \
         (user_choice == "gun" and computer_choice == "snake"):
        result = "win"
        game_state["user_score"] += 1
    else:
        result = "lose"
        game_state["computer_score"] += 1
        
    # Log this round
    round_log = {
        "round": game_state["current_round"],
        "userChoice": user_choice,
        "computerChoice": computer_choice,
        "result": result,
        "userScore": game_state["user_score"],
        "computerScore": game_state["computer_score"]
    }
    game_state["history"].append(round_log)
    
    # Next round
    game_state["current_round"] += 1
    
    # Check if finished
    if game_state["current_round"] > game_state["max_rounds"]:
        game_state["is_finished"] = True
        if game_state["user_score"] > game_state["computer_score"]:
            game_state["final_winner"] = "user"
        elif game_state["computer_score"] > game_state["user_score"]:
            game_state["final_winner"] = "computer"
        else:
            game_state["final_winner"] = "draw"
            
    history_items = []
    for item in game_state["history"]:
        history_items.append(RoundHistoryItem(
            round=item["round"],
            userChoice=item["userChoice"],
            computerChoice=item["computerChoice"],
            result=item["result"],
            userScore=item["userScore"],
            computerScore=item["computerScore"]
        ))
        
    return PlayResponse(
        userChoice=user_choice,
        computerChoice=computer_choice,
        result=result,
        userScore=game_state["user_score"],
        computerScore=game_state["computer_score"],
        currentRound=game_state["current_round"] - 1, # Return the round that was just played
        isFinished=game_state["is_finished"],
        finalWinner=game_state["final_winner"],
        history=history_items
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
