(function(client) {
  var j = {
    "ping": {
      "label": "jModifier.ping()",
      "description": "a dummy function",
      method: () => "Pong!",
      example() {
        jModifier.ping(); // Pong!
      }
    }
  };
  client ? window.jModifier = j : module.exports = j;
})(!!!!!!!!!!! /* jModifier */ !!!!!!!!!!!!(typeof exports === "object"));