localStorage.setItem("data-mode", document.documentElement.getAttribute("data-mode"));
let modes = ["normal", "add-ship", "select-ship", "ship-ready"];
let elems = [];

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
    if (document.documentElement.getAttribute("data-mode") == mode) {
        return mode;
    }
    return null;
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
    let size = el.value;
    setMode("normal");
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
                if (getMode() == "add-ship") {
                    elem.style = "background-color: var(--cell-ship)";
                    let button = document.querySelector(".button-start");
                    button.classList.remove("button-start");
                    button.classList.add("button-unavailable");
                    button.disabled = true;
                    localStorage.setItem("x", elem.getAttribute("x")); // x of selected cell
                    localStorage.setItem("y", elem.getAttribute("y")); // y of selected cell
                    setMode("select-ship");
                }
            });
            elem.addEventListener("mouseover", () => {
                let selectedX = localStorage.getItem("x");
                let hoverX = elem.getAttribute("x");
                let selectedY = localStorage.getItem("y");
                let hoverY = elem.getAttribute("y");
                if (getMode() == "select-ship" && (hoverX != selectedX || hoverY != selectedY)) { // if a cell was selected
                    elems.forEach((e) => {
                        e.style = "background-color: var(--cell-empty)";
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
                        elems.push(elem);
                    }
                    else if (hoverX == selectedX) {
                        Array.prototype.forEach.call(document.getElementsByClassName("cell"), (e) => {
                            let thisX = e.getAttribute("x");
                            let thisY = e.getAttribute("y");
                            if (thisX == hoverX && (thisY > hoverY && thisY < selectedY || thisY < hoverY && thisY > selectedY) && Math.abs(selectedY - thisY) <= 3) {
                                elems.push(e);
                            }
                        });
                        elems.push(elem);
                    }
                    elems.forEach((el) => {
                        el.style = "background-color: var(--cell-ship)";
                    });
                }
            });
            row.appendChild(elem);
        }
        field.appendChild(row);
    }
}
