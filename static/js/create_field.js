let modes = ["normal", "add-ship", "select-ship", "ship-ready", "add-prize"];
let elems = [];

document.onload = () => {
    localStorage.setItem("data-mode", "normal");
    localStorage.setItem("cells", JSON.parse([]));
};

function onFieldCreation() {

}

function setMode(mode) { // change edition mode
    if (modes.includes(mode)) {
        localStorage.setItem("data-mode", mode);
        document.documentElement.setAttribute("data-mode", mode);
    }
}

function getMode() {
    let mode = localStorage.getItem("data-mode");
    if (document.documentElement.getAttribute("data-mode") != mode) {
        document.documentElement.setAttribute("data-mode", mode);
    }
    return mode;
}

function modeChange() { // on mode change button click
    if (document.querySelector(".form-select").value != 0) {
        let mode = document.documentElement.getAttribute("data-mode");
        localStorage.setItem("data-mode", mode);
        let new_mode = modes[(modes.findIndex(i => i === mode) + 1) % modes.length];
        setMode(new_mode);
    }
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
                if (getMode() == "add-ship" && !elem.getAttribute("occupied")) {
                    elem.style = "background-color: var(--cell-ship)";
                    let button = document.querySelector(".button-start");
                    button.classList.add("disabled");
                    button.disabled = true;
                    localStorage.setItem("x", elem.getAttribute("x")); // x of selected cell
                    localStorage.setItem("y", elem.getAttribute("y")); // y of selected cell
                    setMode("select-ship");
                }
                else if (getMode() == "select-ship" && !elem.getAttribute("occupied")) {
                    let cells = JSON.parse(localStorage.getItem("cells"));
                    cells.push({
                        "x" : localStorage.getItem("x"),
                        "y" : localStorage.getItem("y")
                    });
                    elems.forEach((e) => {
                        cells.push({
                            "x" : e.getAttribute("x"),
                            "y" : e.getAttribute("y")
                        });
                        e.setAttribute("selected", false);
                        e.setAttribute("occupied", true);
                    });
                    console.log(cells);
                    localStorage.setItem("cells", JSON.stringify(cells));
                    document.querySelector("#prize-select").disabled = false;
                    setMode("add-prize");
                }
            });
            elem.addEventListener("mouseover", () => {
                let selectedX = localStorage.getItem("x");
                let hoverX = elem.getAttribute("x");
                let selectedY = localStorage.getItem("y");
                let hoverY = elem.getAttribute("y");
                if (getMode() == "select-ship" && !elem.getAttribute("occupied")) { // if a cell was selected
                    elems.forEach((e) => {
                        if ((e.getAttribute("x") != selectedX || e.getAttribute("y") != selectedY) && !e.getAttribute("occupied")) {
                            e.style = "background-color: var(--cell-empty)";
                            e.setAttribute("selected", false);
                        }
                    });
                    elems = [];
                    if (hoverY == selectedY) {
                        let row = elem.parentElement;
                        Array.prototype.forEach.call(row.children, (e) => {
                            let thisX = e.getAttribute("x");
                            if (thisX > hoverX && thisX < selectedX || thisX < hoverX && thisX > selectedX && Math.abs(selectedX - thisX) <= 3) {
                                elems.push(e);
                            }
                        });
                        if (Math.abs(selectedX - hoverX) <= 3) {
                            elems.push(elem);
                        }
                    }
                    else if (hoverX == selectedX) {
                        Array.prototype.forEach.call(document.getElementsByClassName("cell"), (e) => {
                            let thisX = e.getAttribute("x");
                            let thisY = e.getAttribute("y");
                            if (thisX == hoverX && (thisY > hoverY && thisY < selectedY || thisY < hoverY && thisY > selectedY) && Math.abs(selectedY - thisY) <= 3) {
                                elems.push(e);
                            }
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
