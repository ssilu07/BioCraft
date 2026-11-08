# MicroCraft 3D — Unity 6 Companion Engine

This folder contains the complete Unity 6 (Unity 6000.x) C# scripts matching the exact biological simulation engines of MicroCraft:

1. `SoftBodyMembrane3D.cs`: 32-segment deformable soft-body spring-mass cell membrane with osmotic pressure expansion, Verlet integration, and cytolysis burst particle triggering.
2. `CellularRespiration3D.cs`: Full respiration cycle ($C_6H_{12}O_6 + 6O_2 \rightarrow 6CO_2 + 6H_2O + 36\text{-}38\text{ ATP}$), proton gradient ($\Delta \Psi$), and real-time F0/F1 ATP Synthase turbine rotation.
3. `CentralDogmaRibosome3D.cs`: 64-codon dictionary, mRNA translation, tRNA docking, and real-time 3D phenotype expression (GFP bioluminescence, Flagellin tail, Sickle-cell Beta-Globin).
4. `ImmuneSystemWarfare3D.cs`: Viral attacks (Bacteriophage and Coronavirus), Y-shaped antibody secretion, and Macrophage phagocytosis.
5. `OrganicBioAudio3D.cs`: Procedural Web Audio / Unity `OnAudioFilterRead` DSP synthesizer for organic squishy clicks, binaural drones, and ATP bell chimes.

### How to use in Unity:
1. Open Unity Hub and create or open your Unity 6 project.
2. Drag the `unity_assets/Scripts/` folder into your Unity Project window under `Assets/Scripts/`.
3. Attach `SoftBodyMembrane3D` to an empty GameObject with a MeshFilter and MeshRenderer.
4. Attach `CellularRespiration3D` to your Mitochondria prefab and wire its rotor Transform.
