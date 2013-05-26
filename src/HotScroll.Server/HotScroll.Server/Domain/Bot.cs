using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using HotScroll.Server.Hubs;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Domain
{
    public class Bot : Player
    {
        protected Thread WorkingThread { get; set; }
        protected Object ThreadLock { get; set; }
        protected Player Opponent { get; set; }
        protected IHubContext GameHub { get { return GlobalHost.ConnectionManager.GetHubContext<GameHub>(); }}
        protected bool IsPlaying { get; set; }

        public Bot(Player opponent, string connectionId, string name) :base (connectionId, name)
        {
            
        }

        public bool Initialize()
        {
            lock (ThreadLock)
            {
                if (!IsPlaying)
                {
                    IsPlaying = true;
                    WorkingThread = new Thread(GameProcessor);
                    WorkingThread.Start();
                    return true;
                }
                return false;
            }
        }

        protected void GameProcessor()
        {
            
        }
    }
}