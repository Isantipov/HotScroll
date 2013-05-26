using System.Linq;
using HotScroll.Server.Domain;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class GameHub : Hub
    {
        private readonly Game game;

        public GameHub() : this(Game.Instance)
        {
        }

        public GameHub(Game game)
        {
            this.game = game;
        }

        public string CreateDuel()
        {
            var duel = game.CreateDuel(Context.ConnectionId);
            if (duel == null)
            {
                return string.Empty;
            }
            return duel.ToJoinLink();
        }

        public string JoinDuel(string duelId)
        {
            return game.JoinDuel(Context.ConnectionId, duelId);
        }

        public override Task OnConnected()
        {
            game.AddNewPlayer(Context.ConnectionId);
            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            RemovePlayer();
            return base.OnDisconnected();
        }

        public void RemovePlayer()
        {
            game.RemovePlayer(Context.ConnectionId);
        }

        public Player ChangeName(string playerName)
        {
            return game.ChangePlayerName(Context.ConnectionId, playerName);
        }

        public void WaitPartner(Player player)
        {
            game.WaitPartner(Context.ConnectionId);
        }

        public void RecordStep(Step step)
        {
            game.RecordStep(Context.ConnectionId, step);
        }

        public void ReadyToPlay()
        {
            game.ReadyToPlay(Context.ConnectionId);
        }

        public void RetryDuel(string duelToRetryId)
        {
            game.RetryDuel(Context.ConnectionId, duelToRetryId);
        }
    }
}