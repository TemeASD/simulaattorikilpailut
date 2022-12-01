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
const sims = document.querySelectorAll("dl.org-legend");
let filters = [];

// Jos ei filttereitä, laita kaikki pois päältä
if (localStorage.getItem("filters") === null) {
  sims.forEach(sim => {
    filters.push({ "active": false, "simulator": sim.children[1].innerHTML })
  })
  localStorage.setItem("filters", JSON.stringify(filters));
}
// Filtterit muuttujaan, vaihda checkboxien tilaa
filters = JSON.parse(localStorage.getItem("filters"));
filters.forEach(state => {
  sims.forEach(sim => {
    if (state.simulator === sim.children[1].innerHTML && state.active) {
      toggleClass(sim, "hl")
    }
  })
})

filter()


function toggleClass(element, toggleClass) {
  let currentClass = element.className || '';
  let newClass;
  if (currentClass.split(' ').indexOf(toggleClass) > -1) { //has class
    newClass = currentClass.replace(new RegExp('\\b' + toggleClass + '\\b', 'g'), '')
  } else {
    newClass = currentClass + ' ' + toggleClass;
  }
  element.className = newClass.trim();
}


function filter() {
  const datarows = document.querySelectorAll("#dynamic-data tr");
  const active = document.querySelectorAll("dl.org-legend.hl")
  const selected = Array.from(active).map(hl => {
    return hl.dataset.sim
  });

  datarows.forEach(row => {
    if (selected.length < 1) {
      row.style.display = "table-row";
      saveFiltersToLocalStorage(row.children[4].innerHTML, true)

    } else if (selected.length > 0 && !selected.includes(row.children[4].innerHTML)) {
      row.style.display = "none";
      saveFiltersToLocalStorage(row.children[4].innerHTML, false)
    } else {
      saveFiltersToLocalStorage(row.children[4].innerHTML, true)
      row.style.display = "table-row";
    }
  })
}

function saveFiltersToLocalStorage(sim, state) {
  filters.forEach(filter => {
    if (filter.simulator === sim) {
      filter.active = state;
    }
  });
  localStorage.setItem("filters", JSON.stringify(filters));
}