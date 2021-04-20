import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail

from .models import Puzzle, Entry

# Create your views here.
def index(request):
    puzzle = Puzzle.objects.all()
    return render(request, 'crossword/index.html', {
        'puzzle' : puzzle
    })

def renderPuzzle(request, pk):
    entry = Entry.objects.filter(puzzle=pk)
    li = []
    for idx, e in enumerate(entry):
        if e.down == False:
            ori = "across"
        else:
            ori = "down"
        x = {"clue" : f"{e.clue}", "answer" : f"{e.answer}", "position" : f"{e.position}", "orientation" : f"{ori}", "startx" : f"{e.x}", "starty" : f"{e.y}"}
        li.append(x)
    puzzle = Puzzle.objects.get(id=pk)
    puzzle_name = f"{puzzle}"
    puzzle_date = f"{puzzle.pub_date}"
    puzzle_user = f"{puzzle.user}"
    response = dict(item=li, name=puzzle_name, date=puzzle_date, user=puzzle_user)
    return JsonResponse(response, status=200)

# def sendMail(request):
#     data = json.loads(request.body)


@csrf_exempt
def saveProgess(request):
    # if not request.session.exists(request.session.session_key):
    #     request.session.create()
    data = json.loads(request.body)
    time = data['time']
    # progress = data['progress']
    fields = data['input']
    print(time)
    return JsonResponse({"message" : "Success"}, status=200)