/*
Sarjajärjestäjäspesifit kirjoitusasut
*/
const elements = document.querySelectorAll("td[label='Järjestäjä:']");
elements.forEach(element => {
  switch (element.innerHTML) {
    case 'gtfr':
      element.innerHTML = '<a href="https://gtfr.fi/">GTFR</a>'
      break;
    case 'fisra':
      element.innerHTML = '<a href="https://simracing.fi/fisra">FiSRA</a>'
      break;
    case 'fisu':
      element.innerHTML = '<a href="https://simracing.fi/sarjat/11">FiSU</a>'
      break;
    case 'trellet':
      element.innerHTML = '<a href="https://trellet.net/">Trellet</a>'
      break;
    case 'f.a.s.t':
      element.innerHTML = '<a href="https://fast-simracing.com/">F.A.S.T.</a>'
    default:
      element.innerHTML = element.innerHTML

  }
})
//filtterit 
const checkBoxes = document.querySelectorAll("input[type='checkbox']");
function filter(box) {
  const datarows = document.querySelectorAll("#dynamic-data tr");
  console.log(box)
  if (!box.checked) {
    datarows.forEach(row => {
      if (row.children[4].innerHTML === box.value) {
        row.style.display = "none";
      }
    })
  } else {
    datarows.forEach(row => {
      if (row.children[4].innerHTML === box.value) {
        row.style.display = "table-row";
      }
    })
  }
}
