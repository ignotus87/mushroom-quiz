"use strict";

const speciesImport = import("./Species/speciesList.json", {
    assert: { type: 'json' },
    with: { type: 'json' }
});

speciesImport.then(data => {

    const { createApp } = Vue

    createApp({
        data(speciesList) {
            return {
                title: 'Magyarország gombái',
                speciesList: data.default,
                puzzleItems: data.default,
                puzzle: null,
                incorrect1: '',
                incorrect2: '',
                incorrect3: '',
                comment: '',
                gameResultComment: '',
                actualIndex: 1,
                totalPoints: 0,
                imageIndex: 0,
                numberOfAnsweredQuestions: 0,
                numberOfCorrectAnswers: 0,
                previousPuzzleIDs: [],
                game: 'SelectNameByImage',
                choices: [],
                choiceIsRight: [false, false, false, false],
                choiceIsWrong: [false, false, false, false],
                isAnswered: false,
                mistakeIndexes: [],
                gameType: 'all',
                isWrongAnswer: false,
                continueTimeoutHandle: null,
                timeoutSeconds: 0,
                isEndOfGame: true,
                difficulty: 'advanced'
            }
        },
        computed: {
            isBeginner() {
                return this.difficulty === 'beginner';
            },
            isAdvanced() {
                return this.difficulty === 'advanced';
            },
            nextButtonText() {
                return "Tovább (" + this.timeoutSeconds + ")";
            },
            totalSpeciesCount() {
                return this.speciesList.length;
            },
            totalPuzzleItemsCount() {
                return this.puzzleItems.length;
            },
            puzzleName() {
                return this.puzzle.Name;
            },
            puzzleImage() {
                return this.getPuzzleImageByIndex(this.imageIndex);
            },
            puzzleImagesAll() {
                console.log(this.puzzle);
                if (this.puzzle === null || this.puzzle.ImageSource === null) {
                    return null;
                }

                return this.puzzle.ImageSource.map((_, index) => {
                    return this.getPuzzleImageByIndex(index);
                });
            },
            commentToShow() {
                return this.comment;
            },
            gameResultCommentToShow() {
                return this.gameResultComment;
            },
            correctRatio() {
                if (this.numberOfAnsweredQuestions === 0) {
                    return '-';
                }
                else {
                    return (100 * this.numberOfCorrectAnswers / this.numberOfAnsweredQuestions).toFixed() + "%";
                }
            },
            imageSource() {
                if (this.puzzle == null || this.puzzle.ImageSource == null) { return; }

                let temp = this.puzzle.ImageSource[this.imageIndex].replace('https://', '').replace('http://', '');
                if (temp.indexOf('/') > 0) {
                    temp = temp.substring(0, temp.indexOf('/'))
                }
                return temp;
            },
            gameTitle() {
                if (this.game === "SelectNameByImage") {
                    if (this.isEndOfGame) {
                        return "Gombakvíz";
                    }
                    else if (this.gameType === 'all' || this.gameType === '10') {
                        return "Melyik gombafajt látod a képen?";
                    } else {
                        return "Hibásak gyakorlása: Melyik gombafajt látod a képen?";
                    }
                }
            },
            openImageSource() {
                window.open(this.puzzle.ImageSource[this.imageIndex], '_blank');
            },
            isRightAnswer() {
                return !this.isWrongAnswer;
            },
            edibilityInfo() {
                let temp = '';
                if (this.puzzle.IsProtected !== undefined && this.puzzle.IsProtected) {
                    temp += '&#x1F64F; védett, ';
                }
                if (this.puzzle.EdibilityCategory !== undefined) {
                    if (this.puzzle.EdibilityCategory === 'edible') {
                        temp += "&#127860; ehető";
                    } else if (this.puzzle.EdibilityCategory === 'conditionallyEdible') {
                        temp += "&#x26A0;&#127860;  feltételesen ehető";
                    } else if (this.puzzle.EdibilityCategory === 'nonEdible') {
                        temp += "&#x1F922; nem ehető";
                    } else if (this.puzzle.EdibilityCategory === 'poisonous') {
                        temp += "&#x1F571; MÉRGEZŐ";
                    } else {
                        temp += "???" + this.puzzle.EdibilityCategory;
                    }
                }
                return temp;
            },
            hasMoreImagesLeft() {
                return this.imageIndex > 0;
            },
            hasMoreImagesRight() {
                if (this.puzzle == null) { return false; }
                return this.imageIndex < this.puzzle.ImageSource.length - 1;
            }
        },
        methods: {
            getPuzzleImageByIndex(theIndex) {
                return "./SpeciesImages/" + this.puzzle.ID + (theIndex === 0 ? "" : "_" + (theIndex + 1).toString()) + ".jpg";
            },
            slideImageLeft() {
                if (!this.hasMoreImagesLeft) {
                    return;
                }

                var carousel = document.querySelector('.carousel');
                var item = document.querySelector('.item');

                carousel.scrollLeft -= item.clientWidth;
                this.imageIndex--;
            },
            slideImageRight() {
                if (!this.hasMoreImagesRight) {
                    return;
                }

                var carousel = document.querySelector('.carousel');
                var item = document.querySelector('.item');

                carousel.scrollLeft += item.clientWidth;
                this.imageIndex++;
            },
            changeSlide(n) {
                console.log('change slide to ' + n);

                var carousel = document.querySelector('.carousel');
                var item = document.querySelector('.item');

                carousel.scrollLeft = n * item.clientWidth;

                this.imageIndex = n;
                var dots = document.querySelectorAll('.dot');
                var currentImg = this.imageIndex;
            },
            getRandomSpecies() {
                if (this.previousPuzzleIDs.length == this.puzzleItems.length) { return this.puzzle; }

                do {
                    var candidate = this.puzzleItems[Math.floor(Math.random() * this.puzzleItems.length)];
                } while (this.previousPuzzleIDs.some((id) => candidate.ID === id));

                this.previousPuzzleIDs.push(candidate.ID);

                return candidate;
            },
            getThisNumberOfRandomSpecies(numberOfSpeciesToGet) {
                let collectedSpecies = [];
                let collectedIds = [];

                for (let i = 0; i < numberOfSpeciesToGet; ++i) {
                    var randomSpecies = this.getRandomSpeciesFromAllItemsExceptIDs(collectedIds);
                    collectedSpecies.push(randomSpecies);
                    collectedIds.push(randomSpecies.ID);
                }

                return collectedSpecies;
            },
            getRandomSpeciesFromPuzzleItemsExceptIDs(ids) {
                do {
                    var result = this.puzzleItems[Math.floor(Math.random() * this.puzzleItems.length)];
                } while (ids.some((id) => result.ID === id))
                return result;
            },
            getRandomSpeciesFromAllItemsExceptIDs(ids) {
                do {
                    var result = this.speciesList[Math.floor(Math.random() * this.speciesList.length)];
                } while (ids.some((id) => result.ID === id))
                return result;
            },
            getIncorrectAnswers() {

                if (this.isBeginner) {
                    this.getIncorrectAnswersBeginner();
                }
                else {
                    this.getIncorrectAnswersAdvanced();
                }
            },
            getIncorrectAnswersBeginner() {

                console.log('get incorrect answers - beginner');

                this.incorrect1 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID]);
                this.incorrect2 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID, this.incorrect1.ID]);
                this.incorrect3 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID, this.incorrect1.ID, this.incorrect2.ID]);
            },
            getIncorrectAnswersAdvanced() {

                console.log('get incorrect answers - advanced');

                if (this.puzzle.SimilarSpecies.length >= 1) {
                    this.incorrect1 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[0]);
                }
                else {
                    this.incorrect1 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID]);
                }

                if (this.puzzle.SimilarSpecies.length >= 2) {
                    this.incorrect2 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[1]);
                }
                else {
                    this.incorrect2 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID, this.incorrect1.ID]);
                }

                if (this.puzzle.SimilarSpecies.length >= 3) {
                    this.incorrect3 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[2]);
                }
                else {
                    this.incorrect3 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID, this.incorrect1.ID, this.incorrect2.ID]);
                }
            },
            shuffle(array) {
                let currentIndex = array.length, randomIndex;

                // While there remain elements to shuffle.
                while (currentIndex != 0) {

                    // Pick a remaining element.
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;

                    // And swap it with the current element.
                    [array[currentIndex], array[randomIndex]] = [
                        array[randomIndex], array[currentIndex]];
                }

                return array;
            },
            isCorrect(answer) {
                return answer === this.puzzleName;
            },
            answered(answer) {
                if (this.isAnswered) {
                    // It's a second click, it should be a "continue" trigger
                    this.continueAfterAnswer();
                    return;
                }

                this.isAnswered = true;
                var indexOfAnswer = this.choices.indexOf(answer);

                if (this.isCorrect(answer)) {
                    this.comment = '<p><img class="right-wrong-image" src="Images/green_tick.png" alt="Helyes!" />' + this.puzzle.Name + '</p><i class="scientific-name">' + this.puzzle.ScientificName + '</i><br/>' + this.edibilityInfo + '<br/><div class="distinction-info">' + this.puzzle.DistinctionInfo + "</div>";
                    this.choiceIsRight[indexOfAnswer] = true;
                    this.totalPoints++;
                    this.numberOfCorrectAnswers++;

                    this.timeoutSeconds = 4;
                }
                else {
                    this.comment = '<p><img class="right-wrong-image" src="Images/red_x.png" alt="Helytelen!" />' + answer + '<br/>' +
                        '<img class="right-wrong-image" src="Images/green_tick.png" alt="Helyes:">' + this.puzzle.Name + '</p>' +
                        '<i class="scientific-name">' + this.puzzle.ScientificName + '</i><br/>' + this.edibilityInfo + '<br/><div class="distinction-info">' + this.puzzle.DistinctionInfo + "</div>";
                    this.choiceIsWrong[indexOfAnswer] = true;
                    this.mistakeIndexes.push(this.puzzle.ID);
                    var indexOfCorrectAnswer = this.choices.indexOf(this.puzzleName);
                    this.choiceIsRight[indexOfCorrectAnswer] = true;
                    this.isWrongAnswer = true;

                    this.timeoutSeconds = 6;
                }

                this.continueTimeoutHandle = setTimeout(() => this.countdownToContinue(), 1000);

                ++this.numberOfAnsweredQuestions;

                if (this.numberOfAnsweredQuestions == this.totalPuzzleItemsCount) {
                    this.endGame();
                }

            },
            countdownToContinue() {
                if (this.timeoutSeconds > 0) {
                    this.timeoutSeconds--;
                    this.continueTimeoutHandle = setTimeout(() => this.countdownToContinue(), 1000);
                }
                else {
                    this.continueAfterAnswer();
                }
            },
            nextPuzzle() {
                this.puzzle = this.getRandomSpecies();
                this.imageIndex = Math.floor(Math.random() * this.puzzle.ImageSource.length);
                this.getIncorrectAnswers();
                this.randomizeChoices();
                this.resetChoiceColors();
                this.actualIndex++;
                this.changeSlide(this.imageIndex);
                this.isAnswered = false;
                this.isWrongAnswer = false;
            },
            setupQuiz() {
                this.previousPuzzleIDs = [];
                this.actualIndex = 1;
                this.totalPoints = 0;
                this.numberOfCorrectAnswers = 0;
                this.numberOfAnsweredQuestions = 0;
                this.comment = '';
                this.isAnswered = false;
                this.isWrongAnswer = false;
                this.gameResultComment = '';
            },
            startQuiz() {
                this.previousPuzzleIDs = [];
                this.actualIndex = 1;
                this.totalPoints = 0;
                this.numberOfCorrectAnswers = 0;
                this.numberOfAnsweredQuestions = 0;
                this.puzzle = this.getRandomSpecies();
                this.getIncorrectAnswers();
                this.randomizeChoices();
                this.resetChoiceColors();
                this.comment = '';
                this.isAnswered = false;
                this.isWrongAnswer = false;
                this.isEndOfGame = false;
                this.gameResultComment = '';
            },
            reset() {
                this.isEndOfGame = false;
                this.gameType = 'all';
                this.puzzleItems = this.speciesList;
                this.startQuiz()
                this.mistakeIndexes = [];
                this.gameResultComment = '';
            },
            resetAll() {
                this.reset();
            },
            reset10() {
                this.isEndOfGame = false;
                this.gameType = '10';
                this.puzzleItems = this.getThisNumberOfRandomSpecies(10);
                this.startQuiz()
                this.mistakeIndexes = [];
                this.gameResultComment = '';
            },
            restartWithMistakes() {
                this.isEndOfGame = false;
                this.gameType = 'mistakesOnly';
                this.puzzleItems = this.speciesList.filter((item) => this.mistakeIndexes.includes(item.ID));
                this.startQuiz()
                this.mistakeIndexes = [];
                this.gameResultComment = '';
            },
            endGame() {
                this.isEndOfGame = true;
                this.gameResultComment = "&#127937; Vége a játéknak! Eredmény: " + Math.floor(this.totalPoints / this.numberOfAnsweredQuestions * 100) + '%';
            },
            randomizeChoices() {
                this.choices = this.shuffle([this.puzzleName, this.incorrect1.Name, this.incorrect2.Name, this.incorrect3.Name]);
            },
            resetChoiceColors() {
                this.choiceIsRight = [false, false, false, false];
                this.choiceIsWrong = [false, false, false, false];
            },
            continueAfterAnswer() {

                if (this.continueTimeoutHandle != null) {
                    // Stop the timeout for auto-forwarding to the next question
                    clearTimeout(this.continueTimeoutHandle);
                }

                if (this.previousPuzzleIDs.length == this.totalPuzzleItemsCount) {
                    if (!this.isEndOfGame) {
                        this.endGame();
                    }
                }
                else {
                    this.nextPuzzle();
                    this.comment = '';
                }
            }
        },
        created() {
            this.setupQuiz()
        }
    }).mount('#app')
});