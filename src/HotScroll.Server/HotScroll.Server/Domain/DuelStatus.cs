namespace HotScroll.Server.Domain
{
    public enum DuelStatus
    {
        /// <summary>
        ///     Duel has finished.
        /// </summary>
        GameOver = 0,

        /// <summary>
        ///     Duel is currently in progress.
        /// </summary>
        InProgress = 1,

        /// <summary>
        ///     Duel is being prepared
        /// </summary>
        IsPreparing = 2,

        /// <summary>
        ///     Duel has been created but is not activbe yet as ut is
        ///     waiting for players to join the game.
        /// </summary>
        WaitingForPlayers = 3,
    }
}