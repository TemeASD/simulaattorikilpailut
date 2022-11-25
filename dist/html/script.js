/*
*Sarjajärjestäjäspesifit kirjoitusasut
* Tämä kammottava koodi on täällä syystä
* Järjestäjätieto tulee Google Calendarista "kutsut" kohdasta
* Kutsua voi vain sähköpostiosoitteen
* Buildiskripti splittaa ennen @ merkkiä olevan osan ja palauttaa sen "järjestäjä" kohtaan
*/
const elements = document.querySelectorAll("td[label='Järjestäjä:']");
elements.forEach(element => {
  switch (element.innerHTML) {
    case 'kars':
      element.innerHTML = '<a href="https://www.kars.fi/">KARS</a>';
      break;
    case 'gtfr':
      element.innerHTML = '<a href="https://gtfr.fi/">GTFR</a>'
      break;
    case 'fisra':
      element.innerHTML = '<a href="https://simracing.fi/fisra">FiSRA</a>'
      break;
    case 'fisra_gt_challenge':
      element.innerHTML = '<a href="https://simracing.fi/fisra">FiSRA</a>'
      break;
    case 'finnish_simracing_united':
      element.innerHTML = '<a href="https://simracing.fi/sarjat/11">Finnish Simracing United</a>'
      break;
    case 'fisu':
      element.innerHTML = '<a href="https://simracing.fi/sarjat/11">Finnish Simracing United</a>'
      break;
    case 'trellet':
      element.innerHTML = '<a href="https://trellet.net/">Trellet</a>'
      break;
    case 'f.a.s.t':
      element.innerHTML = '<a href="https://fast-simracing.com/">F.A.S.T.</a>'
      break;
    case 'fast':
      element.innerHTML = '<a href="https://fast-simracing.com/">F.A.S.T.</a>'
      break;
    case 'prcf_esports':
      element.innerHTML = '<a href="http://www.porsche-racing-club-finland.fi/PorscheClubs/prc_finland/pc_main.nsf/web/FCAB2C256B83FE18C125847B003B3544">PRCF Esports</a>'
      break;
    default:
      element.innerHTML = element.innerHTML
      break;
  }
})
//filtterit 
const checkBoxes = document.querySelectorAll("input[type='checkbox']");
let filters = [];

// Jos ei filttereitä, laita kaikki päälle
if (localStorage.getItem("filters") === null) {
  checkBoxes.forEach(box => {
    filters.push({ "checked": true, "simulator": box.value })
    box.checked = true;
  })
  localStorage.setItem("filters", JSON.stringify(filters));
}
// Filtterit muuttujaan, vaihda checkboxien tilaa
const searchState = JSON.parse(localStorage.getItem("filters"));
searchState.forEach(state => {
  checkBoxes.forEach(box => {
    if (state.simulator === box.value) {
      box.checked = state.checked;
    }
  })
})

function filter(box) {
  const datarows = document.querySelectorAll("#dynamic-data tr");
  console.log(box)
  if (!box.checked) {
    datarows.forEach(row => {
      if (row.children[4].innerHTML === box.value) {
        row.style.display = "none";
        searchState.forEach(state => {
          if (state.simulator === box.value) {
            state.checked = false;
            localStorage.setItem("filters", JSON.stringify(searchState));
          }
        })
      }
    })
  } else {
    datarows.forEach(row => {
      if (row.children[4].innerHTML === box.value) {
        row.style.display = "table-row";
        searchState.forEach(state => {
          if (state.simulator === box.value) {
            state.checked = true;
            localStorage.setItem("filters", JSON.stringify(searchState));
          }
        })

      }
    })
  }
}
