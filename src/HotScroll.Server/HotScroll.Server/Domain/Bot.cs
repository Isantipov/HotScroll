using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Web;
using HotScroll.Server.Hubs;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Domain
{
    public class Bot : Player
    {
        protected Timer WorkingTimer { get; set; }
        protected Object ThreadLock { get; set; }
        protected Player Opponent { get; set; }
        protected IHubContext GameHub { get { return GlobalHost.ConnectionManager.GetHubContext<GameHub>(); }}
        protected bool IsPlaying { get; set; }

        public Bot(Player opponent, string connectionId, string name) :base (connectionId, name)
        {
            Opponent = opponent;
            ThreadLock = new object();
        }

        public bool Initialize()
        {
            lock (ThreadLock)
            {
                if (!IsPlaying)
                {
                    IsPlaying = true;
                    /*TODO: Start playing*/
                    return true;
                }
                return false;
            }
        }

        public void Stop()
        {
            lock (ThreadLock)
            {
                IsPlaying = false;
                /*TODO: Stop playing*/
            }
        }

        protected void GameProcessor(object args)
        {
            
        }
    }
}