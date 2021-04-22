import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.mail import send_mail

from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .models import Puzzle, Entry, Subscriber

# Create your views here.
def getLatestPuzzle(request):
    # puzzle = Puzzle.objects.order_by('-pub_date')[0]
    puzzle = Puzzle.objects.all()[0]
    entry = Entry.objects.filter(puzzle=puzzle)
    li = []
    for idx, e in enumerate(entry):
        if e.down == False:
            ori = "across"
        else:
            ori = "down"
        x = {"clue" : f"{e.clue}", "answer" : f"{e.answer}", "position" : f"{e.position}", "orientation" : f"{ori}", "startx" : f"{e.x}", "starty" : f"{e.y}"}
        li.append(x)
    puzzle_name = f"{puzzle}"
    puzzle_date = f"{puzzle.pub_date}"
    puzzle_user = f"{puzzle.user}"
    puzzle_id = f"{puzzle.id}"
    response = dict(item=li, name=puzzle_name, date=puzzle_date, user=puzzle_user, id=puzzle_id)
    return JsonResponse(response, status=200)

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
    puzzle_id = f"{puzzle.id}"
    response = dict(item=li, name=puzzle_name, date=puzzle_date, user=puzzle_user, id=puzzle_id)
    return JsonResponse(response, status=200)

def sendMail(request):
    if request.POST['name'] != "":
        name = request.POST['name']
    else:
        name = "Dear"
    
    subject = 'Welcome'
    # html_message = render_to_string('crossword/email_template.html', {'name': name})
    # plain_message = strip_tags(html_message)

    message = f'Hi , Thank you for Subscribing Our Service.'
    email_from = settings.EMAIL_HOST_USER
    mail = request.POST['email']
    recipient_list = [mail, ]
    send_mail( subject, message, email_from, recipient_list )
    sub = Subscriber.objects.create(email=mail , name=name)
    sub.save()
    return JsonResponse({"message" : "Success"})


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
