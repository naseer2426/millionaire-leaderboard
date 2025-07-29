import random

def main():
    # Step 1: Take number of teams
    num_teams = int(input("Enter number of teams: "))

    # Step 2: Take number of chits for each team
    bowl = []
    for team in range(1, num_teams + 1):
        chits = int(input(f"Enter number of chits for Team {team}: "))
        bowl.extend([team] * chits)

    # Step 3: Randomly draw one chit from the bowl
    if not bowl:
        print("No chits in the bowl. Cannot draw.")
        return

    winning_team = random.choice(bowl)
    print(f"\n🎉 Team {winning_team} won the draw!")

if __name__ == "__main__":
    main()
