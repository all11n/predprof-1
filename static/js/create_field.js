let modes = ["normal", "add-ship", "select-ship", "ship-ready", "add-prize", "edit-ship"];
let elems = [];
let prizes = { 1000: "promo1000", 2000: "promo2000", 3000: "promo3000" };
let selected;

document.onload = () => {
    localStorage.setItem("data-mode", "normal");
    localStorage.setItem("cells", JSON.stringify([]));
    localStorage.setItem("prizes", JSON.stringify([]));
    localStorage.setItem("x", "");
    localStorage.setItem("y", "");
};

function setMode(mode) { // change edition mode
    if (modes.includes(mode)) {
        localStorage.setItem("data-mode", mode);
        document.documentElement.setAttribute("data-mode", mode);
        document.querySelector(".button-cancel").disabled = mode != "add-prize";
        document.querySelector("#add-ship").disabled = mode != "normal";
        document.querySelector("#prize-select").disabled = mode != "add-prize" && mode != "edit-ship";
    }
    if (mode == "add-prize" || mode == "edit-ship") {
        document.querySelector(".button-cancel").classList.remove("disabled");
        document.querySelector("#prize-select").classList.remove("disabled");
    }
    else {
        document.querySelector(".button-cancel").classList.add("disabled");
        document.querySelector("#prize-select").classList.remove("disabled");
    }
    if (mode != "normal") {
        document.querySelector("#add-ship").classList.add("disabled");
    }
    else {
        document.querySelector("#add-ship").classList.remove("disabled");
    }
    
}

function onFieldCreation() {

}

function selectPrize(el) { // assign prize to ship
    let value = el.value;
    if (getMode() == "add-prize" && value != "0") {
        let prize = document.createElement("div");
        let image_path = "/static/styles/images/" + prizes[el.value] + ".png";
        let img = new Image(39, 39);
        img.src = image_path;
        prize.appendChild(img);
        prize.setAttribute("type", value);
        selected.appendChild(prize);
        let prizes_arr = JSON.parse(localStorage.getItem("prizes")) || [];
        prizes_arr.push(value);
        localStorage.setItem("prizes", JSON.stringify(prizes_arr));
        setMode("normal");
        el.value = "0";
    }
}

function cancelAddition() {
    elems.forEach((e) => {
        e.style = "background-color: var(--cell-empty)";
    });
    markCells(elems, false, false);
    let cells = JSON.parse(localStorage.getItem("cells"));
    cells.pop();
    localStorage.setItem("cells", JSON.stringify(cells));
    setMode("normal");
}

function markCells(cells, selected, occupied) {
    let maxX = -1;
    let minX = 100;
    let maxY = -1;
    let minY = 100;
    cells.forEach((e) => {
        let thisX = Number(e.getAttribute("x"));
        let thisY = Number(e.getAttribute("y"));
        if (thisX > maxX) maxX = thisX;
        if (thisX < minX) minX = thisX;
        if (thisY > maxY) maxY = thisY;
        if (thisY < minY) minY = thisY;
    });
    Array.prototype.forEach.call(document.getElementsByClassName("cell"), (e) => {
        let thisX = Number(e.getAttribute("x"));
        let thisY = Number(e.getAttribute("y"));
        if (thisX >= minX - 1 && thisX <= maxX + 1 && thisY >= minY - 1 && thisY <= maxY + 1) {
            e.setAttribute("selected", selected);
            e.setAttribute("occupied", occupied);
        }
    });
}

function getMode() { // get edition mode
    let mode = localStorage.getItem("data-mode");
    if (document.documentElement.getAttribute("data-mode") != mode) {
        document.documentElement.setAttribute("data-mode", mode);
    }
    return mode;
}

function onCreateButtonClick() {
    setMode("add-ship");
}

function onOptionChange(el) {
    localStorage.setItem("cells", JSON.stringify([]));
    elems = [];
    let size = el.value;
    setMode("normal");
    document.querySelector("#add-ship").classList.remove("disabled");
    document.querySelector("#add-ship").disabled = false;
    document.querySelector("#prize-select").disabled = true;
    let field = document.querySelector(".field");
    field.innerHTML = "";
    for (let i = 0; i < size; ++i) {
        let row = document.createElement("tr");
        row.classList.add("field__row");
        for (let j = 0; j < size; ++j) {
            let elem = document.createElement("td");
            elem.classList.add("cell");
            elem.setAttribute("x", j);
            elem.setAttribute("y", i);
            elem.addEventListener("click", () => { // on cell click
                if (getMode() == "add-ship" && elem.getAttribute("occupied") != "true") {
                    elem.style = "background-color: var(--cell-ship)";
                    let button = document.querySelector(".button-start");
                    button.classList.add("disabled");
                    button.disabled = true;
                    localStorage.setItem("x", elem.getAttribute("x")); // x of selected cell
                    localStorage.setItem("y", elem.getAttribute("y")); // y of selected cell
                    setMode("select-ship");
                    selected = elem;
                }
                else if (getMode() == "select-ship" && elem.getAttribute("occupied") != "true") {
                    let cells_arr = JSON.parse(localStorage.getItem("cells"));
                    let cells = [];
                    elems.push(selected);
                    elems.forEach((e) => {
                        cells.push({
                            "x": e.getAttribute("x"),
                            "y": e.getAttribute("y")
                        });
                    });
                    markCells(elems, false, true);
                    cells_arr.push(cells);
                    localStorage.setItem("cells", JSON.stringify(cells_arr));
                    document.querySelector("#prize-select").disabled = false;
                    setMode("add-prize");
                }
            });
            elem.addEventListener("mouseover", () => {
                let selectedX = Number(localStorage.getItem("x"));
                let hoverX = Number(elem.getAttribute("x"));
                let selectedY = Number(localStorage.getItem("y"));
                let hoverY = Number(elem.getAttribute("y"));
                if (getMode() == "select-ship" && elem.getAttribute("occupied") != "true") { // if a cell was selected
                    elems.forEach((e) => {
                        if ((e.getAttribute("x") != selectedX || e.getAttribute("y") != selectedY) && e.getAttribute("occupied") != "true") {
                            e.style = "background-color: var(--cell-empty)";
                            e.setAttribute("selected", false);
                        }
                    });
                    elems = [];
                    if (hoverY == selectedY) {
                        let row = elem.parentElement;
                        Array.prototype.every.call(row.children, (e) => {
                            let thisX = Number(e.getAttribute("x"));
                            if ((thisX > hoverX && thisX < selectedX || thisX < hoverX && thisX > selectedX) && Math.abs(selectedX - thisX) <= 3) {
                                elems.push(e);
                            }
                            if (e.getAttribute("occupied") == "true") {
                                elems = [];
                                return false;
                            }
                            return true;
                        });
                        if (Math.abs(selectedX - hoverX) <= 3) {
                            elems.push(elem);
                        }
                    }
                    else if (hoverX == selectedX) {
                        Array.prototype.every.call(document.getElementsByClassName("cell"), (e) => {
                            let thisX = Number(e.getAttribute("x"));
                            let thisY = Number(e.getAttribute("y"));
                            if (thisX == hoverX && (thisY > hoverY && thisY < selectedY || thisY < hoverY && thisY > selectedY) && Math.abs(selectedY - thisY) <= 3) {
                                elems.push(e);
                            }
                            if (e.getAttribute("occupied") == "true") {
                                elems = [];
                                return false;
                            }
                            return true;
                        });
                        if (Math.abs(selectedY - hoverY) <= 3) {
                            elems.push(elem);
                        }
                    }
                    elems.forEach((el) => {
                        el.setAttribute("selected", true);
                        el.style = "background-color: var(--cell-ship)";
                    });
                }
            });
            row.appendChild(elem);
        }
        field.appendChild(row);
    }
}
