(function(client) {
  var j = {
    ping: function() {
      return arguments.length === 0 ? "jModifier.ping() - a dummy function" : (
        ({
          ping: () => "Pong!"
        })["ping"].apply(this, arguments)
      )
    }
  };
  client ? window.jModifier = j : module.exports = j;
})(!!!!!!!!!!! /* jModifier */ !!!!!!!!!!!!(typeof exports === "object"));