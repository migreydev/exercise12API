function getParams() {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  let params = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}
