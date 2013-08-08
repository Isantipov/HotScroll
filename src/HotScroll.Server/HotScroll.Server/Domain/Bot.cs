using System;
using System.Linq;
using System.Timers;

namespace HotScroll.Server.Domain
{
    public class Bot : Player
    {
        #region Constants

        public const int MinStepInterval = 40;
        public const int MaxStepInterval = 120;

        public const int MinKeepReversed = 5;
        public const int MaxKeepReversed = 15;
        
        public const int MinImpulse = 1;
        public const int MaxImpulse = 3;

        private const int CountdownTimer = 3500;

        #endregion

        protected Timer GameTimer { get; set; }
        protected Object ThreadLock { get; set; }
        protected Player Opponent { get; set; }
        protected bool IsPlaying { get; set; }
        protected int Points { get; set; }
        protected int PointsToKeepReversed { get; set; }
        protected int Direction { get; set; }
        protected int Speed { get; set; }
        public DuelProjection Duel { get; set; }

        private readonly Game game;

        public Bot(Player opponent, string connectionId, string name) :base (connectionId, name)
        {
            game = Game.Instance;
            Speed = MinStepInterval;
            Opponent = opponent;
            ThreadLock = new object();
            Direction = 1;
            GameTimer = new Timer(Speed);
            GameTimer.Elapsed += OnGameTimerElapsed;
        }

        public void Play()
        {
            lock (ThreadLock)
            {
                if (!IsPlaying)
                {
                    var timer = new Timer(CountdownTimer);
                    timer.Start();
                    timer.Elapsed += (sender, args) =>
                    {
                        IsPlaying = true;
                        GameTimer.Start();
                        timer.Close();
                    };                    
                }
            }
        }

        public void Stop()
        {
            lock (ThreadLock)
            {
                Points = 0;
                IsPlaying = false;
                Duel = null;
                Direction = 1;
                GameTimer.Stop();
            }
        }

        protected LevelEvent TryPopEvent(int score)
        {
            var evnt = Duel.Level.Events.FirstOrDefault(t => t.Score <= score);
            if (evnt != null)
            {
                Duel.Level.Events.Remove(evnt);
            }
            return evnt;
        }

        protected void OnGameTimerElapsed(object sender, ElapsedEventArgs e)
        {
            GameTimer.Interval = GetNextRandomInterval();
            if (Direction < 0 && PointsToKeepReversed > 0)
            {
                // reduce number of points to go in reversed direction
                PointsToKeepReversed--;
            }
            else if (Direction < 0 && PointsToKeepReversed <= 0)
            {
                // change direction back to normal
                Direction = 1;
            }
            if (TryPopEvent(Points) != null)
            {
                // Reverse direction
                Direction *= -1;
                PointsToKeepReversed = game.Random.Next(MinKeepReversed, MaxKeepReversed + 1);
            }
            Points += Direction;
            game.RecordStep(ConnectionId, new Step{PlayerId = ConnectionId, Points = Points});
        }

        protected double GetNextRandomInterval()
        {
            var impDir = game.Random.Next(-1, 2); /* -1 is min; 1 is max */
            var imp = game.Random.Next(MinImpulse, MaxImpulse + 1);
            var interval = GameTimer.Interval + impDir * imp;
            if (interval < MinStepInterval)
            {
                interval = MinStepInterval;
            }
            if (interval > MaxStepInterval)
            {
                interval = MaxStepInterval;
            }
            return interval;
        }
    }
}