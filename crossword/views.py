import json

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.mail import send_mail


from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from .utils import get_clues, create_grid
from .models import Puzzle, Entry, Subscriber


def index(request):
    puzzle = Puzzle.objects.all()
    return render(request, 'crossword/index.html', {
        'puzzle' : puzzle
    })

# Create your views here.
def getLatestPuzzle(request):
    puzzle = Puzzle.objects.order_by('-pub_date')[0]
    # puzzle = Puzzle.objects.all()[0]
    entry = Entry.objects.filter(puzzle=puzzle)
    
    grid = create_grid(puzzle, 15)
    across_clues = get_clues(puzzle, grid, False)
    down_clues = get_clues(puzzle, grid, True)
    
    now = timezone.now()
    next_puzzle = Puzzle.objects.filter(number__lt=puzzle.number).order_by('-number')
    next_puzzle = next_puzzle.filter(pub_date__lte=now)
    li = []
    across_count = 0
    down_count = 0
    for idx, e in enumerate(entry):
        if e.down == False:
            ori = "across"
            if e.number == 0:
                position = across_clues[across_count]['number']
                across_count += 1
            else:
                position = e.number
        else:
            ori = "down"
            if e.number == 0:
                position = down_clues[down_count]['number']
                down_count += 1
            else:
                position = e.number
        x = {"clue" : f"{e.clue}", "answer" : f"{e.answer}", "position" : f"{position}", "orientation" : f"{ori}", "startx" : f"{e.x}", "starty" : f"{e.y}"}
        li.append(x)
    puzzle_name = f"{puzzle}"
    puzzle_date = f"{puzzle.pub_date}"
    puzzle_user = f"{puzzle.user}"
    puzzle_id = f"{puzzle.id}"
    if next_puzzle.exists():
        next_puzzle = f"{next_puzzle[0].number}"
    else:
        next_puzzle = 0
    response = dict(item=li, name=puzzle_name, date=puzzle_date, user=puzzle_user, id=puzzle_id, next=next_puzzle)
    return JsonResponse(response, status=200)



def renderPuzzle(request, pk):
    entry = Entry.objects.filter(puzzle=pk)
    obj = Puzzle.objects.get(id=pk)

    grid = create_grid(obj, 15)
    across_clues = get_clues(obj, grid, False)
    down_clues = get_clues(obj, grid, True)
    
    now = timezone.now()
    next_puzzle = Puzzle.objects.filter(number__lt=obj.number).order_by('-number')
    next_puzzle = next_puzzle.filter(pub_date__lte=now)

    li = []
    across_count = 0
    down_count = 0
    for idx, e in enumerate(entry):
        if e.down == False:
            ori = "across"
            if e.number == 0:
                position = across_clues[across_count]['number']
                across_count += 1
            else:
                position = e.number
        else:
            ori = "down"
            if e.number == 0:
                position = down_clues[down_count]['number']
                down_count += 1
            else:
                position = e.number
        x = {"clue" : f"{e.clue}", "answer" : f"{e.answer}", "position" : f"{position}", "orientation" : f"{ori}", "startx" : f"{e.x}", "starty" : f"{e.y}"}
        li.append(x)
    puzzle = Puzzle.objects.get(id=pk)
    puzzle_name = f"{puzzle}"
    puzzle_date = f"{puzzle.pub_date}"
    puzzle_user = f"{puzzle.user}"
    puzzle_id = f"{puzzle.id}"
    if next_puzzle.exists():
        next_puzzle = f"{next_puzzle[0].number}"
    else:
        next_puzzle = 0
    response = dict(item=li, name=puzzle_name, date=puzzle_date, user=puzzle_user, id=puzzle_id, next=next_puzzle)
    return JsonResponse(response, status=200)


@csrf_exempt
def sendMail(request):
    data = json.load(request.body)
    if data.name != "":
        name = data.name
    else:
        name = "Dear"
    
    subject = 'Welcome'
    # html_message = render_to_string('crossword/email_template.html', {'name': name})
    # plain_message = strip_tags(html_message)

    message = f'Hi , Thank you for Subscribing Our Service.'
    email_from = settings.EMAIL_HOST_USER
    mail = data.email
    recipient_list = [mail, ]
    send_mail( subject, message, email_from, recipient_list )
    sub = Subscriber.objects.create(email=mail , name=name)
    sub.save()
    return JsonResponse({"message" : "Success"})


@csrf_exempt
def saveProgess(request):
    if not request.session.exists(request.session.session_key):
        request.session.create()
    data = json.loads(request.body)
    time = data['time']
    perc = data['percentage']
    user = request.session.session_key
    print(user, perc, time)
    return JsonResponse({"message" : "Success"}, status=200)