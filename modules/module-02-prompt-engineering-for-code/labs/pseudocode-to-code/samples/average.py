numbers = [5, 2, 9, 1, 7, 4]
total = 0
count = 0

for idx in range(len(numbers)):
    value = numbers[idx]
    if value % 2 == 1:
        total += value
        count += 1

if count == 0:
    print("No odd numbers.")
else:
    average = total / count
    print("Average odd number:")
    print(average)
