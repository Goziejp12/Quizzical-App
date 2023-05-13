import React from "react"
import Quiz from "./Quiz"

export default function App() {
    const [quiz, setQuiz] = React.useState([])
    const [fetchQuiz, setFetchQuiz] = React.useState([])
    const [selectedAnswer, setSelectedAnswer] = React.useState([])
    const [isChecked, setIsChecked] = React.useState(false)
    const [isClickEnabled, setIsClickEnabled] = React.useState(true)
    const [refetchQuizData, setRefetchQuizData] = React.useState(false)
    
    
    React.useEffect(() => {
        fetch("https://opentdb.com/api.php?amount=5")
            .then(res => res.json())
            .then(data => setFetchQuiz(data.results))
    }, [refetchQuizData])
    
    // sets the quiz state variable to the modified quiz items fetched from the API
    function handleStartQuizButton() {
        setQuiz(createNewQuizWithAnswerObject)
    }
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for(let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array
    }
    
    function createNewQuiz() {
        const newQuiz = []
        for(let i = 0; i < fetchQuiz.length; i++) {
            // Combines both correct and incorrect answers in one array
            const answers = [fetchQuiz[i].correct_answer, ...fetchQuiz[i].incorrect_answers]
            // Shuffle the answers randomly to change their positions in the array
            const shuffleAnswers = shuffleArray(answers)
            // Find the index of the correct answer in the shuffled answer array in order to keep track of the correct answer.
            const correctAnswerIndex = shuffleAnswers.findIndex(answer => {
                return answer === fetchQuiz[i].correct_answer
                })
            newQuiz.push({
                ...fetchQuiz[i],
                correctAnswerIndex,
                answers: shuffleAnswers
            })
        }
        return newQuiz
    }
    
    function createNewQuizWithAnswerObject() {
        const newQuiz = [...createNewQuiz()]
        newQuiz.map(quizItems => {
            quizItems.answers.map((answer, answerIndex) => {
                quizItems.answers[answerIndex] = {
                    answer: answer,
                    isSelected: false
                }
            })
        })
        return newQuiz
    }
    
    /*  
        This handles when the answer is selected. The overall idea is to ensure that only one answer is selected at a time 
        for any particular quiz question. 
    */
    function handleSelectAnswer(quizIndex, answerIndex) {
        if(isClickEnabled) {
        // Made a copy of the selectedAnswer initial state to a new array
        const newSelectedAnswer = [...selectedAnswer]
        /*  
            Changed the item in the new array, which is holding the index/position of the quiz question to be answered with the selected 
            answer index. This is to keep track of the index of the selected answer in its array set.
        */
        newSelectedAnswer[quizIndex] = answerIndex
        // Set the selected answer to this newly created array
        setSelectedAnswer(newSelectedAnswer)
        
        const newQuiz = quiz.map((quizItems, index) => {
            /*  
                The purpose of this particular line of code (if (index !== quizIndex) {return quizItem}) is to check if the current 
                `quizItem` being iterated over in the `map` method has the same index as the `quizIndex` passed as an argument to the 
                `handleSelectAnswer` function. If the `index` of the current `quizItem` being iterated over is not equal to `quizIndex`, 
                the `map` method returns the `quizItem` as it is. This is because we only want to update the `selectedAnswer` for the 
                specific `quizIndex` passed to the `handleSelectAnswer` function, while leaving the other `quizItems` in the `quiz` 
                array unchanged. In other words, this code allows us to modify only the specific `quizItem` that matches the `quizIndex` 
                passed to `handleSelectAnswer` while leaving the rest of the `quiz` array untouched. 
            */
            if(index !== quizIndex) {
                return quizItems
            }
            return {
                ...quizItems,
                answers: quizItems.answers.map((answer, answerIndex) => {
                    /*  
                        The line of code `if (answerIndex === newSelectedAnswer[quizIndex])` is used instead of 
                        `if (answerIndex === selectedAnswer[quizIndex])` because `newSelectedAnswer` is a copy of the 
                        `selectedAnswer` state array that has been updated to reflect the selected answer for the current quiz question. 
                        When the user selects an answer option, `newSelectedAnswer` is updated with the new selected answer index at the 
                        index of the current quiz question. This allows us to keep track of the selected answer for each quiz question 
                        separately. So, we need to compare `answerIndex` with the selected answer for the current quiz question, which is 
                        stored in `newSelectedAnswer[quizIndex]`. Therefore, we cannot use `selectedAnswer[quizIndex]` in the comparison 
                        because it has not been updated yet to reflect the newly selected answer. 
                    */
                    if(newSelectedAnswer[quizIndex] === answerIndex) {
                        return {...answer, isSelected: true}
                    }
                    else {
                        return {...answer, isSelected: false}
                    }
                })
            }
        })
        setQuiz(newQuiz)}
    }
    
    function handleCheckAnswersButton() {
        setIsChecked(true) // Checks quiz score
        setIsClickEnabled(false) // Disables answers' buttons when `check answer` is clicked
    }
    
    function handlePlayAgainButton() {
        setIsChecked(false) // Disables checking quiz score
        setIsClickEnabled(true) // Enables answers' buttons when `Play again` is clicked
        setRefetchQuizData(prev => !prev) // Fetches new quiz data when `Play again` is clicked
        setQuiz(createNewQuizWithAnswerObject) // Updates the initial quiz data state with the newly fetched data
    }
    
    // Returns a new array that contains only the answers matching the correct answer of each question set and other elements as undefined.
    function selectedCorrectAnswersArray() {
        let score
        if(isChecked) {
            return quiz.map(quizItems => {
                return score = quizItems.answers.filter((answer, answerIndex) => {
                    if(answer.isSelected) {
                        return quizItems.correctAnswerIndex === answerIndex
                    }
                })[0]
            })
        }
        return score
    }
    
    // Filtered out undefined elements returned by the selectedCorrectAnswersArray function
    function score() {
        return selectedCorrectAnswersArray().filter(Boolean)
    }
    
    return (
        // Checks if the quiz data has been fetched from the API
        quiz.length > 0 ?
        <main>
            <Quiz
                quiz={quiz}
                handleSelectAnswer={handleSelectAnswer}
                selectedAnswer={selectedAnswer}
                isChecked={isChecked}
                refetchQuizData={refetchQuizData}
            />
            
            {
                isChecked ?
                <div className="checked">
                    <h2>
                        {score().length === quiz.length ? 
                        `You scored ${score().length} / ${quiz.length} Congratulations!🎉` : 
                        `You scored ${score().length} / ${quiz.length}`}
                    </h2>
                    <button 
                        onClick={handlePlayAgainButton}
                        className="play-again-button"
                    >
                        Play again
                    </button>
                </div>
                :
                <button 
                    onClick={handleCheckAnswersButton}
                    className="check-answers-button"
                >
                    Check answers
                </button>
            }
        </main>
            :
        <div className="quiz-intro-section">
            <div className="quiz-intro">
                <h1>Quizzical</h1>
                <p>Some description if needed</p>
                <button 
                    onClick={handleStartQuizButton}
                    className="startQuizBtn"
                >
                    Start quiz
                </button>
            </div>
        </div>
    )
}