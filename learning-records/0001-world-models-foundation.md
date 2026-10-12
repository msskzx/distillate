# World-models foundation

## Learned

A world model is an internal simulator, usually operating in a learned latent state rather than raw observations. Its value is not perfect realism; it is sufficiently accurate prediction of consequences for the agent's decisions. Planning can happen by searching or optimizing through imagined trajectories.

## Key distinction

MuZero demonstrates that a planning model need not reconstruct the world. It can learn only the representation, dynamics, reward, value, and policy signals needed by its planner.

## Open questions

How do latent dynamics models preserve long-term information? When should an agent trust imagination versus collect more real data?

