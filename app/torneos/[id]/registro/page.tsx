  useEffect(() => {
    trackEvent('Tournament Registration Started', {
      tournament_id: tournamentId,
    });

    async function loadTournament() {
      if (!tournamentId || tournamentId.startsWith('demo-')) return;

      try {
        const { data, error } = await supabase
          .from('prokicks_tournaments')
          .select('*')
          .eq('id', tournamentId)
          .maybeSingle();

        if (error) throw error;
        if (data) setTournament(data as Tournament);
      } catch (error) {
        captureError(error, {
          area: 'tournament-registration-select',
          tournamentId,
        });
      }
    }

    loadTournament();
  }, [tournamentId]);
