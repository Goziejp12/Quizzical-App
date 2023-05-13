import React from "react"
import { decode } from "html-entities"
import classNames from "classnames"

export default function Quiz(props) {
    const quizElement = props.quiz.map((quizItems, quizIndex) => {
        return (<div key={quizIndex}>
            <h1>{decode(quizItems.question)}</h1>
            <div className="answers">
                {quizItems.answers.map((answerObj, answerIndex) => {
                    return (<button 
                        key={answerIndex}
                        onClick={() => props.handleSelectAnswer(quizIndex, answerIndex)}
                        className={
                            classNames("answersButton", {
                                /*  
                                    Ensures that only one answer is selected at a time in each question. The `selected` class changes 
                                    the background color.
                                */
                                "selected": !props.isChecked && props.selectedAnswer[quizIndex] === answerIndex && answerObj.isSelected,
                                /*  
                                    This line of code `!answerObj.isSelected` removes the `correct-answer` class from any answer object 
                                    whose its `isSelected` property is true. That is, if the player got the correct answer of a particular 
                                    question, the correct answer marker will be removed and the selected answer marker/background color will 
                                    be maintained when the `check answer` button is clicked.
                                */
                                "correct-answer": props.isChecked && quizItems.correctAnswerIndex === answerIndex && !answerObj.isSelected,
                                "checked-answers": props.isChecked && answerObj.isSelected
                            })
                        }
                    >
                        {decode(answerObj.answer)}
                    </button>)
                })}
            </div>
            <hr />
        </div>)
    })
    return (
        <div>
           {quizElement} 
        </div>
    )
}